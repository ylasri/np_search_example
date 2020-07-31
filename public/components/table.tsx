import React from 'react';
import { EuiInMemoryTable, EuiHealth } from '@elastic/eui';

export const SuspectsTable = (data: any) => {
  // eslint-disable-next-line no-console
  const columns = [
    {
      field: '_source.phone_number',
      name: 'Phone Number',
      sortable: true,
    },
    {
      field: '_source.call_count',
      name: 'Call Count',
      sortable: true,
    },
    {
      field: '_source.call_duration',
      name: 'Call Minutes',
      sortable: true,
      render: (value: any) => value.toFixed(2),
    },
    {
      field: '_source.call_charges',
      name: 'call Charges',
      sortable: true,
      render: (value: any) => value.toFixed(2),
    },
    {
      field: '_source.customer.account_age',
      name: 'Account Age',
      sortable: true,
    },
    {
      field: '_source.customer.churn',
      name: 'Chrun Status',
      sortable: true,
    },
    {
      field: '_source.customer.churn',
      name: 'Churn Health',
      sortable: true,
      render: (v: any) => {
        const color = v === '0' ? 'success' : 'danger';
        const label = v === '0' ? 'No Risk' : 'Will churn';
        return <EuiHealth color={color}>{label}</EuiHealth>;
      },
    },
  ];

  const sorting: any = {
    sort: {
      field: '_source.call_charges',
      direction: 'desc',
    },
  };

  return (
    <EuiInMemoryTable
      items={data.data}
      itemId="_id"
      columns={columns}
      sorting={sorting}
      compressed={true}
      pagination={true}
    />
  );
};
