"use client";

import React, { ChangeEvent, useEffect, useState } from "react";
import Select from "react-select";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FormattedProviders, Product } from "@/app/lib/definitions";
import { formatCurrency } from "@/app/lib/utils";
import { Button } from "../button";

export default function Form({
  providerId,
  providers,
  products,
  onSubmit,
}: {
  products: Product[] | null;
  providerId: string | null;
  providers: Omit<FormattedProviders, "inn" | "phone" | "site">[];
  onSubmit: (products: Record<string, number>) => void;
}) {
  const [state, setState] = useState<Record<string, number>>({});
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  useEffect(() => {
    setState({});
  }, [providerId]);

  const params = new URLSearchParams(searchParams);

  const providerOptions = providers.map((p) => ({
    value: p.id,
    label: p.name,
  }));

  const handleProviderChange = (value: string) => {
    params.set("providerId", value);
    replace(`${pathname}?${params.toString()}`);
  };

  const onCountChange = (e: ChangeEvent<HTMLInputElement>) => {
    setState((prev) => ({ ...prev, [e.target.name]: Number(e.target.value) }));
  };

  const isShowSubmitButton =
    Object.values(state).length &&
    Object.values(state)?.reduce((acc, v) => acc + v) >= 1;

  return (
    <section className="w-full pt-6 pb-24">
      <h1 className="text-2xl">Создать новый заказ</h1>
      <div className="border-b border-gray-200 py-6">
        <span className="block font-medium text-gray-900 mb-2">
          Выберите поставщика
        </span>

        <Select
          placeholder="Выберите поставщика"
          value={providerOptions.find((o) => o.value === providerId)}
          isClearable
          onChange={(v) => handleProviderChange(v?.value || "")}
          options={providerOptions}
          isSearchable={false}
        />
      </div>

      <div className="flex flex-col gap-5 my-10">
        {products?.map((p) => (
          <div
            className="flex flex-col justify-between p-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            key={p.id}
          >
            <div>Название товара: {p.name}</div>
            <div>Цена за 1ед товара {formatCurrency(p.price)}</div>
            <input
              className="text-black rounded mt-3"
              name={p.id}
              id={p.id}
              type="number"
              defaultValue={0}
              step={5}
              onChange={onCountChange}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-1">
        {isShowSubmitButton ? (
          <Button onClick={() => onSubmit(state)}>Оформить заказ</Button>
        ) : null}
        <Link
          href="/invoices"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Отменить
        </Link>
      </div>
    </section>
  );
}
