import { getCustomRepository, getRepository } from 'typeorm';

import AppError from '../errors/AppError';
import Category from '../models/Category';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface RequestDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: RequestDTO): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    if (type === 'outcome') {
      const { total } = await transactionsRepository.getBalance();
      if (total < value) throw new AppError('Saldo insuficiente.', 400);
    }

    const category_id = await this.getCategoryByName(category);

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }

  private async getCategoryByName(category: string): Promise<string> {
    const categoriesRepository = getRepository(Category);

    const categoryFind = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (categoryFind) return categoryFind.id;

    const categoryCreate = categoriesRepository.create({
      title: category,
    });

    await categoriesRepository.save(categoryCreate);

    return categoryCreate.id;
  }
}

export default CreateTransactionService;
