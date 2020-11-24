import { EntityRepository, getCustomRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}
interface SumTramsaction {
  type: 'income' | 'outcome';
  balance: string;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const transactions = (await transactionsRepository
      .createQueryBuilder('transaction')
      .select('transaction.type', 'type')
      .addSelect('SUM(transaction.value)', 'balance')
      .groupBy('transaction.type')
      .getRawMany()) as SumTramsaction[];

    const income = parseFloat(
      transactions
        .filter(transaction => transaction.type === 'income')
        .map(transaction => transaction.balance)
        .find(balance => balance) || '0',
    );

    const outcome = parseFloat(
      transactions
        .filter(transaction => transaction.type === 'outcome')
        .map(transaction => transaction.balance)
        .find(balance => balance) || '0',
    );

    const total = income - outcome;

    return { income, outcome, total };
  }
}

export default TransactionsRepository;
