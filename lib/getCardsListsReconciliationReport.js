/**
 * @param {{ card_number: string; permissions: number; }[]} nextActiveCards
 * @param {{ card_number: string; permissions: number; position: string; }[]} accxActiveCards
 */
function getCardsListsReconciliationReport(
  nextActiveCardsInitial,
  accxActiveCards
) {
  const nextActiveCards = nextActiveCardsInitial.map((activeCard) => {
    const foundAccxActiveCard = accxActiveCards.find((accxActiveCard) => {
      return (
        activeCard.card_number === accxActiveCard.card_number
      );
    });

    return foundAccxActiveCard
      ? { ...foundAccxActiveCard, ...activeCard } : activeCard;
  });

  const modifications = nextActiveCards.filter((activeCard) => {
    // If the card is not in the accxActiveCards list, it should be added
    return !accxActiveCards.some((accxCard) => {
      return (
        accxCard.card_number === activeCard.card_number
        && accxCard.permissions === activeCard.permissions
      );
    });
  });
  const overflow = [];

  const removals = accxActiveCards.filter((accxCard) => {
    const isPresentInNextActiveCards = nextActiveCards.some((activeCard) => {
      return (
        accxCard.card_number === activeCard.card_number
        && accxCard.permissions === activeCard.permissions
      );
    });

    const isPresentInModifications = modifications.some((modifiedAccxCard) => {
      return accxCard.card_number === modifiedAccxCard.card_number;
    });

    return !isPresentInNextActiveCards && !isPresentInModifications;
  });

  modifications.sort((a, b) => {
    if (a.position && b.position) {
      return a.position < b.position;
    }
    if (a.position && !b.position) {
      return 1;
    }
    if (!a.position && b.position) {
      return -1;
    }
    return a.card_number < b.card_number;
  });

  const occupiedCardPositions = new Set(
    nextActiveCards.flatMap((card) => {
      return card.position || [];
    })
  );

  let index = 0;
  const nextModifications = modifications.map((card) => {
    if (card.position) {
      return card;
    }

    while (occupiedCardPositions.has(index.toString())) {
      index += 1;
    }

    occupiedCardPositions.add(index.toString());
    const nextCard = { ...card, position: index.toString() };

    index += 1;
    return nextCard;
  });

  const nextRemovals = removals.filter((removedAccxCard) => {
    return !nextModifications.some((modifiedAccxCard) => {
      return modifiedAccxCard.position === removedAccxCard.position;
    });
  });

  return {
    removals: nextRemovals,
    modifications: nextModifications,
    overflow,
  };
}

module.exports = getCardsListsReconciliationReport;
