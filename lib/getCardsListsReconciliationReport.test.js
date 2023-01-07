const { expect } = require('@hapi/code');
const Lab = require('@hapi/lab');
const getCardsListsReconciliationReport = require('./getCardsListsReconciliationReport');

const lab = Lab.script();

lab.experiment('getCardsListsReconciliationReport', () => {
  lab.test('base case, empty lists, should produce empty report', () => {
    const report = getCardsListsReconciliationReport([], []);
    expect(report).to.equal({
      modifications: [],
      overflow: [],
      removals: [],
    });
  });

  lab.test('add single card', () => {
    const report = getCardsListsReconciliationReport(
      [{ card_number: '6609', permissions: 100 }],
      []
    );
    expect(report).to.equal({
      modifications: [{ card_number: '6609', permissions: 100, position: '0' }],
      overflow: [],
      removals: [],
    });
  });

  lab.test('add multiple cards', () => {
    const report = getCardsListsReconciliationReport(
      [
        { card_number: '6609', permissions: 100 },
        { card_number: '8001', permissions: 100 }
      ],
      []
    );
    expect(report).to.equal({
      modifications: [
        { card_number: '6609', permissions: 100, position: '0' },
        { card_number: '8001', permissions: 100, position: '1' }
      ],
      overflow: [],
      removals: [],
    });
  });

  lab.test('add multiple cards around existing card', () => {
    const report = getCardsListsReconciliationReport(
      [
        { card_number: '6609', permissions: 100 },
        { card_number: '8001', permissions: 100 },
        { card_number: '8002', permissions: 100 },
      ],
      [
        { card_number: '8001', permissions: 100, position: '1' }
      ]
    );
    expect(report).to.equal({
      modifications: [
        { card_number: '6609', permissions: 100, position: '0' },
        { card_number: '8002', permissions: 100, position: '2' }
      ],
      overflow: [],
      removals: [],
    });
  });

  lab.test('preserve existing card', () => {
    const report = getCardsListsReconciliationReport(
      [{ card_number: '6609', permissions: 100 }],
      [{ card_number: '6609', permissions: 100, position: '0' }]
    );
    expect(report).to.equal({
      modifications: [],
      overflow: [],
      removals: [],
    });
  });

  lab.test('update existing card permissions', () => {
    const report = getCardsListsReconciliationReport(
      [{ card_number: '6609', permissions: 100 }],
      [{ card_number: '6609', permissions: 83, position: '1' }]
    );

    expect(report).to.equal({
      modifications: [{ card_number: '6609', permissions: 100, position: '1' }],
      overflow: [],
      removals: [],
    });
  });

  lab.test('delete inactive card', () => {
    const report = getCardsListsReconciliationReport(
      [],
      [{ card_number: '6609', permissions: 100, position: '0' }]
    );

    expect(report).to.equal({
      modifications: [],
      overflow: [],
      removals: [{ card_number: '6609', permissions: 100, position: '0' }],
    });
  });

  lab.test('replace deleted card with new card', () => {
    const report = getCardsListsReconciliationReport(
      [{ card_number: '2204', permissions: 100 }],
      [{ card_number: '8802', permissions: 100, position: '0' }]
    );

    expect(report).to.equal({
      modifications: [{ card_number: '2204', permissions: 100, position: '0' }],
      overflow: [],
      removals: [],
    });
  });
});

module.exports = { lab };
