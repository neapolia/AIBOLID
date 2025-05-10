'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { formatCurrency } from '@/app/lib/utils';

type InvoiceProduct = {
  id: string;
  name: string;
  article: string;
  price: number;
  count: number;
};

type InvoiceDetails = {
  id: string;
  created_at: string;
  provider_name: string;
  status: string;
  payment_status: string;
  products: InvoiceProduct[];
  total_amount: number;
};

export default function InvoiceDetailsModal({
  isOpen,
  onClose,
  invoice,
}: {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceDetails | null;
}) {
  if (!invoice) return null;

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Закрыть</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                      Заказ #{invoice.id}
                    </Dialog.Title>
                    <div className="mt-4 space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">Поставщик: {invoice.provider_name}</p>
                        <p className="text-sm text-gray-500">
                          Дата создания: {new Date(invoice.created_at).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          Статус: {invoice.status === 'pending' ? 'Ожидает' : 'Выполнен'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Статус оплаты: {invoice.payment_status === 'pending' ? 'Не оплачен' : 'Оплачен'}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Товары:</h4>
                        <div className="mt-2 divide-y divide-gray-200">
                          {invoice.products.map((product) => (
                            <div key={product.id} className="py-2">
                              <p className="text-sm font-medium text-gray-900">{product.name}</p>
                              <p className="text-sm text-gray-500">Артикул: {product.article}</p>
                              <p className="text-sm text-gray-500">
                                Количество: {product.count} шт.
                              </p>
                              <p className="text-sm text-gray-500">
                                Цена: {formatCurrency(product.price)}
                              </p>
                              <p className="text-sm text-gray-500">
                                Сумма: {formatCurrency(product.price * product.count)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-gray-200 pt-4">
                        <p className="text-base font-medium text-gray-900">
                          Итого: {formatCurrency(invoice.total_amount)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 