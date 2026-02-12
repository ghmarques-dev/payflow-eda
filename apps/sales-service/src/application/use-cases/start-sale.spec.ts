import { InMemorySalesRepository } from '../repositories/database';

import { SalesRepository } from '@/domain/repositories';

import { StartSaleUseCase } from './start-sale';

let salesRepository: SalesRepository;
let sut: StartSaleUseCase;

describe('start sale use case', () => {
  beforeEach(async () => {
    salesRepository = new InMemorySalesRepository();

    sut = new StartSaleUseCase(salesRepository);
  });

  it('should be able create sale draft', async () => {
    const response = await sut.execute({
      operator_id: '123',
      store_id: '456',
    });

    expect(response).toEqual(
      expect.objectContaining({
        sale_id: expect.any(String),
        operator_id: '123',
        store_id: '456',
        status: 'DRAFT',
        items: [],
        created_at: expect.any(Date),
      }),
    );
  });

  it('should be able salesRepository call with correct values', async () => {
    const salesRepositorySpy = jest.spyOn(salesRepository, 'createDraft');

    await sut.execute({
      operator_id: '123',
      store_id: '456',
    });

    expect(salesRepositorySpy).toHaveBeenCalledWith({
      operator_id: '123',
      store_id: '456',
      status: 'DRAFT',
    });
  });
});
