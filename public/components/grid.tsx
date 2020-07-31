/* eslint-disable no-shadow */
import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { EuiDataGrid } from '@elastic/eui';

const columns = [
  {
    id: 'phone_number',
  },
  {
    id: 'call_count',
  },
  {
    id: 'call_duration',
  },
  {
    id: 'call_charges',
  },
  {
    id: 'account_age',
  },
  {
    id: 'churn',
  },
  {
    id: 'customer_service_calls',
  },
  {
    id: 'international_plan',
  },
  {
    id: 'number_vmail_messages',
  },
  {
    id: 'state',
  },
  {
    id: 'voice_mail_plan',
  },
];

export const SuspectsGrid = (data: any) => {
  // ** Pagination config
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
  const onChangeItemsPerPage = useCallback(
    (pageSize) => setPagination((pagination) => ({ ...pagination, pageSize, pageIndex: 0 })),
    [setPagination]
  );
  const onChangePage = useCallback(
    (pageIndex) => setPagination((pagination) => ({ ...pagination, pageIndex })),
    [setPagination]
  );

  // ** Sorting config
  const [sortingColumns, setSortingColumns] = useState([]);
  const onSort = useCallback(
    (sortingColumns) => {
      setSortingColumns(sortingColumns);
    },
    [setSortingColumns]
  );

  // Column visibility
  const [visibleColumns, setVisibleColumns] = useState(() => columns.map(({ id }) => id));
  // initialize to the full set of columns

  const renderCellValue = useMemo(() => {
    return ({ rowIndex, columnId, setCellProps }: any) => {
      useEffect(() => {
        if (columnId === 'call_duration' || columnId === 'call_charges') {
          if (data.data.hasOwnProperty(rowIndex)) {
            const numeric = parseFloat(data.data[rowIndex][columnId]);
            setCellProps({
              style: {
                backgroundColor: `rgba(0, 255, 0, ${numeric * 0.002})`,
              },
            });
          }
        }
      }, [rowIndex, columnId, setCellProps]);

      return data.data.hasOwnProperty(rowIndex) ? data.data[rowIndex][columnId] : null;
    };
  }, [data.data]);

  return (
    <EuiDataGrid
      aria-label="Churn List Grid"
      columns={columns}
      columnVisibility={{ visibleColumns, setVisibleColumns }}
      rowCount={data.data.length}
      renderCellValue={({ rowIndex, columnId }) => data.data[rowIndex][columnId]}
      // renderCellValue={renderCellValue}
      inMemory={{ level: 'sorting' }}
      sorting={{ columns: sortingColumns, onSort }}
      pagination={{
        ...pagination,
        pageSizeOptions: [5, 10, 15],
        onChangeItemsPerPage,
        onChangePage,
      }}
      // Optional. Allows you to configure what features the toolbar shows.
      // The prop also accepts a boolean if you want to toggle the entire toolbar on/off.
      toolbarVisibility={{
        showColumnSelector: true,
        showStyleSelector: true,
        showSortSelector: true,
        showFullScreenSelector: true,
      }}
      // Optional. Change the initial style of the grid.
      gridStyle={{
        border: 'all',
        fontSize: 's',
        cellPadding: 's',
        stripes: true,
        rowHover: 'highlight',
        header: 'underline',
      }}
    />
  );
};
