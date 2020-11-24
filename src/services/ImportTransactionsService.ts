import fs from 'fs';
import path from 'path';

import UploadConfig from '../config/upload.config';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

class ImportTransactionsService {
  async execute(filename: string): Promise<Transaction[]> {
    const filePath = path.join(UploadConfig.directory, filename);

    const contentFile = fs.readFileSync(filePath, 'utf8');

    const lines = contentFile.split(/\r\n|\r|\n/g);

    const transactions: Transaction[] = [];

    const linesFilter = lines.filter(
      (line, index) => index > 0 && line.length > 0,
    );

    for (const line of linesFilter) {
      const transaction = await this.getTransaction(line);
      transactions.push(transaction);
    }

    return transactions;
  }

  getTransaction = async (line: string): Promise<Transaction> => {
    const createTransactionService = new CreateTransactionService();

    const [title, typeStr, value, category] = line.split(/, /g);

    const type = typeStr as 'income' | 'outcome';

    const transaction = await createTransactionService.execute({
      title,
      type,
      value: parseFloat(value),
      category,
    });

    return transaction;
  };
}

export default ImportTransactionsService;
