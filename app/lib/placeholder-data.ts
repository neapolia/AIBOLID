// This file contains placeholder data that you'll be replacing with real data in the Data Fetching chapter:
// https://nextjs.org/learn/dashboard-app/fetching-data

const providers = [
  {
    id: "d6e15727-9fe1-4961-8c5b-ea44a9bd81aa",
    name: "ООО «Иксора-Трейд»",
    inn: "7701234567",
    phone: "+7 (495) 123-45-67",
    site: "https://ixora-trade.ru",
  },
  {
    id: "3958dc9e-712f-4377-85e9-fec4b6a6442a",
    name: "ООО «АвтоПром»",
    inn: "7707654321",
    phone: "+7 (495) 765-43-21",
    site: "https://www.autoprom.ru",
  },
  {
    id: "3958dc9e-742f-4377-85e9-fec4b6a6442a",
    name: "ООО «АвтоЗапчасти»",
    inn: "7700987654",
    phone: "+7 (495) 111-22-33",
    site: "https://autozapchasti.ru",
  },
  {
    id: "3958dc9e-742f-4377-85e9-fec4b6a6442b",
    name: "ООО «АвтоМасла»",
    inn: "7701234568",
    phone: "+7 (495) 222-33-44",
    site: "https://automasla.ru",
  },
  {
    id: "3958dc9e-742f-4377-85e9-fec4b6a6442c",
    name: "ООО «АвтоФильтры»",
    inn: "7701234569",
    phone: "+7 (495) 333-44-55",
    site: "https://autofilters.ru",
  },
  {
    id: "3958dc9e-742f-4377-85e9-fec4b6a6442d",
    name: "ООО «АвтоАккумуляторы»",
    inn: "7701234570",
    phone: "+7 (495) 444-55-66",
    site: "https://autoakkum.ru",
  },
  {
    id: "3958dc9e-742f-4377-85e9-fec4b6a6442e",
    name: "ООО «АвтоШины»",
    inn: "7701234571",
    phone: "+7 (495) 555-66-77",
    site: "https://autoshiny.ru",
  }
];

const products = [
  {
    id: "ba351ebd-b01e-4580-a159-d3e235e96c2f",
    name: "Тормозные колодки Brembo",
    provider_id: "d6e15727-9fe1-4961-8c5b-ea44a9bd81aa",
    price: 1200,
    article: "BRK123",
  },
  {
    id: "ae8c2011-d6a6-4ed4-9eed-c4e2cbb189ee",
    name: "Масляный фильтр Mann",
    provider_id: "d6e15727-9fe1-4961-8c5b-ea44a9bd81aa",
    price: 450,
    article: "FLT789",
  },
  {
    id: "a9ae78dc-9cf3-4098-8807-34bf5e4c21cd",
    name: "Воздушный фильтр Bosch",
    provider_id: "3958dc9e-712f-4377-85e9-fec4b6a6442a",
    price: 800,
    article: "AIR456",
  },
  {
    id: "b9ae78dc-9cf3-4098-8807-34bf5e4c21ce",
    name: "Масло моторное 5W-40 Mobil 1",
    provider_id: "3958dc9e-742f-4377-85e9-fec4b6a6442b",
    price: 3500,
    article: "OIL789",
  },
  {
    id: "c9ae78dc-9cf3-4098-8807-34bf5e4c21cf",
    name: "Свечи зажигания NGK",
    provider_id: "3958dc9e-742f-4377-85e9-fec4b6a6442a",
    price: 450,
    article: "SPK456",
  },
  {
    id: "d9ae78dc-9cf3-4098-8807-34bf5e4c21d0",
    name: "Топливный фильтр Delphi",
    provider_id: "3958dc9e-742f-4377-85e9-fec4b6a6442c",
    price: 1200,
    article: "FUEL123",
  },
  {
    id: "e9ae78dc-9cf3-4098-8807-34bf5e4c21d1",
    name: "Салонный фильтр Valeo",
    provider_id: "3958dc9e-742f-4377-85e9-fec4b6a6442c",
    price: 950,
    article: "CAB789",
  },
  {
    id: "f9ae78dc-9cf3-4098-8807-34bf5e4c21d2",
    name: "Амортизатор KYB",
    provider_id: "3958dc9e-742f-4377-85e9-fec4b6a6442a",
    price: 3500,
    article: "SHK001",
  },
  {
    id: "g9ae78dc-9cf3-4098-8807-34bf5e4c21d3",
    name: "Ремень ГРМ Gates",
    provider_id: "3958dc9e-742f-4377-85e9-fec4b6a6442a",
    price: 2800,
    article: "TIM002",
  },
  {
    id: "h9ae78dc-9cf3-4098-8807-34bf5e4c21d4",
    name: "Тормозная жидкость DOT-4",
    provider_id: "3958dc9e-742f-4377-85e9-fec4b6a6442b",
    price: 650,
    article: "BRF003",
  },
  {
    id: "i9ae78dc-9cf3-4098-8807-34bf5e4c21d5",
    name: "Аккумулятор Bosch S4",
    provider_id: "3958dc9e-742f-4377-85e9-fec4b6a6442d",
    price: 8500,
    article: "BAT001",
  },
  {
    id: "j9ae78dc-9cf3-4098-8807-34bf5e4c21d6",
    name: "Шина летняя Michelin 205/55R16",
    provider_id: "3958dc9e-742f-4377-85e9-fec4b6a6442e",
    price: 4500,
    article: "TIR001",
  },
  {
    id: "k9ae78dc-9cf3-4098-8807-34bf5e4c21d7",
    name: "Шина зимняя Bridgestone 205/55R16",
    provider_id: "3958dc9e-742f-4377-85e9-fec4b6a6442e",
    price: 5200,
    article: "TIR002",
  },
  {
    id: "l9ae78dc-9cf3-4098-8807-34bf5e4c21d8",
    name: "Тормозной диск Brembo",
    provider_id: "d6e15727-9fe1-4961-8c5b-ea44a9bd81aa",
    price: 2800,
    article: "BRK124",
  },
  {
    id: "m9ae78dc-9cf3-4098-8807-34bf5e4c21d9",
    name: "Масло трансмиссионное 75W-90",
    provider_id: "3958dc9e-742f-4377-85e9-fec4b6a6442b",
    price: 1200,
    article: "OIL002",
  },
  {
    id: "n9ae78dc-9cf3-4098-8807-34bf5e4c21e0",
    name: "Ремень генератора Gates",
    provider_id: "3958dc9e-742f-4377-85e9-fec4b6a6442a",
    price: 1200,
    article: "TIM003",
  },
  {
    id: "o9ae78dc-9cf3-4098-8807-34bf5e4c21e1",
    name: "Стартер Bosch",
    provider_id: "3958dc9e-742f-4377-85e9-fec4b6a6442a",
    price: 8500,
    article: "STR001",
  },
  {
    id: "p9ae78dc-9cf3-4098-8807-34bf5e4c21e2",
    name: "Генератор Valeo",
    provider_id: "3958dc9e-742f-4377-85e9-fec4b6a6442a",
    price: 12000,
    article: "GEN001",
  }
];

const storage = [
  {
    id: "2595f543-3c66-4984-b5d4-72234f38ca4b",
    product_id: "ba351ebd-b01e-4580-a159-d3e235e96c2f",
    count: 25,
  },
  {
    id: "5200bf60-32c4-4972-8639-8ea1f662a7a1",
    product_id: "ae8c2011-d6a6-4ed4-9eed-c4e2cbb189ee",
    count: 40,
  },
  {
    id: "34bd7549-a51a-4596-a2b4-6925ff965311",
    product_id: "a9ae78dc-9cf3-4098-8807-34bf5e4c21cd",
    count: 30,
  },
  {
    id: "44bd7549-a51a-4596-a2b4-6925ff965312",
    product_id: "b9ae78dc-9cf3-4098-8807-34bf5e4c21ce",
    count: 50,
  },
  {
    id: "54bd7549-a51a-4596-a2b4-6925ff965313",
    product_id: "c9ae78dc-9cf3-4098-8807-34bf5e4c21cf",
    count: 100,
  },
  {
    id: "64bd7549-a51a-4596-a2b4-6925ff965314",
    product_id: "d9ae78dc-9cf3-4098-8807-34bf5e4c21d0",
    count: 20,
  },
  {
    id: "74bd7549-a51a-4596-a2b4-6925ff965315",
    product_id: "e9ae78dc-9cf3-4098-8807-34bf5e4c21d1",
    count: 35,
  },
  {
    id: "84bd7549-a51a-4596-a2b4-6925ff965316",
    product_id: "f9ae78dc-9cf3-4098-8807-34bf5e4c21d2",
    count: 15,
  },
  {
    id: "94bd7549-a51a-4596-a2b4-6925ff965317",
    product_id: "g9ae78dc-9cf3-4098-8807-34bf5e4c21d3",
    count: 12,
  },
  {
    id: "a4bd7549-a51a-4596-a2b4-6925ff965318",
    product_id: "h9ae78dc-9cf3-4098-8807-34bf5e4c21d4",
    count: 40,
  },
  {
    id: "b4bd7549-a51a-4596-a2b4-6925ff965319",
    product_id: "i9ae78dc-9cf3-4098-8807-34bf5e4c21d5",
    count: 8,
  },
  {
    id: "c4bd7549-a51a-4596-a2b4-6925ff965320",
    product_id: "j9ae78dc-9cf3-4098-8807-34bf5e4c21d6",
    count: 20,
  },
  {
    id: "d4bd7549-a51a-4596-a2b4-6925ff965321",
    product_id: "k9ae78dc-9cf3-4098-8807-34bf5e4c21d7",
    count: 20,
  },
  {
    id: "e4bd7549-a51a-4596-a2b4-6925ff965322",
    product_id: "l9ae78dc-9cf3-4098-8807-34bf5e4c21d8",
    count: 15,
  },
  {
    id: "f4bd7549-a51a-4596-a2b4-6925ff965323",
    product_id: "m9ae78dc-9cf3-4098-8807-34bf5e4c21d9",
    count: 30,
  },
  {
    id: "g4bd7549-a51a-4596-a2b4-6925ff965324",
    product_id: "n9ae78dc-9cf3-4098-8807-34bf5e4c21e0",
    count: 25,
  },
  {
    id: "h4bd7549-a51a-4596-a2b4-6925ff965325",
    product_id: "o9ae78dc-9cf3-4098-8807-34bf5e4c21e1",
    count: 5,
  },
  {
    id: "i4bd7549-a51a-4596-a2b4-6925ff965326",
    product_id: "p9ae78dc-9cf3-4098-8807-34bf5e4c21e2",
    count: 5,
  }
];

const invoices = [
  {
    created_at: "4-20-2025",
    delivery_date: "4-22-2025",
    provider_id: "d6e15727-9fe1-4961-8c5b-ea44a9bd81aa",
    docs_url: null,
    status: true,
    payment_status: true,
    order_details: [
      {
        product_id: "ba351ebd-b01e-4580-a159-d3e235e96c2f",
        count: 10,
      },
      {
        product_id: "ae8c2011-d6a6-4ed4-9eed-c4e2cbb189ee",
        count: 20,
      },
    ],
  },
  {
    created_at: "4-22-2025",
    delivery_date: null,
    provider_id: "3958dc9e-712f-4377-85e9-fec4b6a6442a",
    docs_url: null,
    status: true,
    payment_status: true,
    order_details: [
      {
        product_id: "a9ae78dc-9cf3-4098-8807-34bf5e4c21cd",
        count: 100,
      },
    ],
  },
];

export { providers, invoices, storage, products };
