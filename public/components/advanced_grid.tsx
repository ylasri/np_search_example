import React, {
  createContext,
  useContext,
  useCallback,
  useReducer,
  useState,
  Fragment,
} from 'react';

import {
  EuiDataGrid,
  EuiCheckbox,
  EuiButtonIcon,
  EuiPopover,
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPopoverTitle,
  EuiSpacer,
  EuiPortal,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiTitle,
  EuiDescriptionList,
  EuiDescriptionListTitle,
  EuiDescriptionListDescription,
} from '@elastic/eui';

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
export const SuspectsAdvancedGrid = (data: any) => {
  const SelectionContext = createContext(undefined);

  const SelectionButton = () => {
    const [selectedRows] = useContext(SelectionContext);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    if (selectedRows.size > 0) {
      return (
        <EuiPopover
          isOpen={isPopoverOpen}
          anchorPosition="upCenter"
          panelPaddingSize="s"
          button={
            <EuiButtonEmpty
              size="xs"
              iconType="arrowDown"
              color="primary"
              className="euiDataGrid__controlBtn"
              onClick={() => setIsPopoverOpen(!isPopoverOpen)}
            >
              {selectedRows.size} {selectedRows.size > 1 ? 'items' : 'item'} selected
            </EuiButtonEmpty>
          }
          closePopover={() => setIsPopoverOpen(false)}
          ownFocus={true}
        >
          <EuiPopoverTitle>
            {selectedRows.size} {selectedRows.size > 1 ? 'items' : 'item'}
          </EuiPopoverTitle>
          <div style={{ width: 150 }}>
            <button onClick={() => alert('hello')}>
              <EuiFlexGroup alignItems="center" component="span" gutterSize="s">
                <EuiFlexItem grow={false}>
                  <EuiButtonIcon aria-label="Pin selected items" iconType="pin" color="text" />
                </EuiFlexItem>
                <EuiFlexItem>Pin items</EuiFlexItem>
              </EuiFlexGroup>
            </button>
            <EuiSpacer size="s" />
            <button onClick={() => alert('hello')}>
              <EuiFlexGroup alignItems="center" component="span" gutterSize="s">
                <EuiFlexItem grow={false}>
                  <EuiButtonIcon aria-label="Delete selected items" iconType="trash" color="text" />
                </EuiFlexItem>
                <EuiFlexItem>Delete items</EuiFlexItem>
              </EuiFlexGroup>
            </button>
          </div>
        </EuiPopover>
      );
    } else {
      return null;
    }
  };

  const SelectionHeaderCell = () => {
    const [selectedRows, updateSelectedRows] = useContext(SelectionContext);
    const isIndeterminate = selectedRows.size > 0 && selectedRows.size < data.data.length;
    return (
      <EuiCheckbox
        id="selection-toggle"
        aria-label="Select all rows"
        indeterminate={isIndeterminate}
        checked={selectedRows.size > 0}
        onChange={(e) => {
          if (isIndeterminate) {
            // clear selection
            updateSelectedRows({ action: 'clear' });
          } else {
            if (e.target.checked) {
              // select everything
              updateSelectedRows({ action: 'selectAll' });
            } else {
              // clear selection
              updateSelectedRows({ action: 'clear' });
            }
          }
        }}
      />
    );
  };

  const SelectionRowCell = ({ rowIndex }: any) => {
    const [selectedRows, updateSelectedRows] = useContext(SelectionContext);
    const isChecked = selectedRows.has(rowIndex);

    return (
      <div>
        <EuiCheckbox
          id={`${rowIndex}`}
          aria-label={`Select row ${rowIndex}, ${data.data[rowIndex].name}`}
          checked={isChecked}
          onChange={(e) => {
            if (e.target.checked) {
              updateSelectedRows({ action: 'add', rowIndex });
            } else {
              updateSelectedRows({ action: 'delete', rowIndex });
            }
          }}
        />
      </div>
    );
  };

  const FlyoutRowCell = (rowIndex: any) => {
    let flyout;
    const [isFlyoutOpen, setIsFlyoutOpen] = useState(false);
    if (isFlyoutOpen) {
      const rowData = data.data[rowIndex.rowIndex];

      const details = Object.entries(rowData).map(([key, value]: any) => {
        return (
          <Fragment>
            <EuiDescriptionListTitle>{key}</EuiDescriptionListTitle>
            <EuiDescriptionListDescription>{value}</EuiDescriptionListDescription>
          </Fragment>
        );
      });

      flyout = (
        <EuiPortal>
          <EuiFlyout ownFocus onClose={() => setIsFlyoutOpen(!isFlyoutOpen)}>
            <EuiFlyoutHeader hasBorder>
              <EuiTitle size="m">
                <h2>{rowData.phone_number}</h2>
              </EuiTitle>
            </EuiFlyoutHeader>
            <EuiFlyoutBody>
              <EuiDescriptionList>{details}</EuiDescriptionList>
            </EuiFlyoutBody>
          </EuiFlyout>
        </EuiPortal>
      );
    }

    return (
      <Fragment>
        <EuiButtonIcon
          color="text"
          iconType="eye"
          iconSize="s"
          aria-label="View details"
          onClick={() => setIsFlyoutOpen(!isFlyoutOpen)}
        />
        {flyout}
      </Fragment>
    );
  };

  const leadingControlColumns = [
    {
      id: 'selection',
      width: 32,
      headerCellRender: SelectionHeaderCell,
      rowCellRender: SelectionRowCell,
    },
    {
      id: 'View',
      width: 36,
      headerCellRender: () => null,
      rowCellRender: FlyoutRowCell,
    },
  ];

  const trailingControlColumns = [
    {
      id: 'actions',
      width: 40,
      headerCellRender: () => null,
      rowCellRender: function RowCellRender() {
        const [isPopoverOpen, setIsPopoverOpen] = useState(false);
        return (
          <div>
            <EuiPopover
              isOpen={isPopoverOpen}
              anchorPosition="upCenter"
              panelPaddingSize="s"
              button={
                <EuiButtonIcon
                  aria-label="show actions"
                  iconType="boxesHorizontal"
                  color="text"
                  onClick={() => setIsPopoverOpen(!isPopoverOpen)}
                />
              }
              closePopover={() => setIsPopoverOpen(false)}
              ownFocus={true}
            >
              <EuiPopoverTitle>Actions</EuiPopoverTitle>
              <div style={{ width: 150 }}>
                <button onClick={() => alert('hello')}>
                  <EuiFlexGroup alignItems="center" component="span" gutterSize="s">
                    <EuiFlexItem grow={false}>
                      <EuiButtonIcon aria-label="Pin selected items" iconType="pin" color="text" />
                    </EuiFlexItem>
                    <EuiFlexItem>Pin</EuiFlexItem>
                  </EuiFlexGroup>
                </button>
                <EuiSpacer size="s" />
                <button onClick={() => alert('hello')}>
                  <EuiFlexGroup alignItems="center" component="span" gutterSize="s">
                    <EuiFlexItem grow={false}>
                      <EuiButtonIcon
                        aria-label="Delete selected items"
                        iconType="trash"
                        color="text"
                      />
                    </EuiFlexItem>
                    <EuiFlexItem>Delete</EuiFlexItem>
                  </EuiFlexGroup>
                </button>
              </div>
            </EuiPopover>
          </div>
        );
      },
    },
  ];

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });
  const setPageIndex = useCallback((pageIndex) => setPagination({ ...pagination, pageIndex }), [
    pagination,
    setPagination,
  ]);
  const setPageSize = useCallback(
    (pageSize) => setPagination({ ...pagination, pageSize, pageIndex: 0 }),
    [pagination, setPagination]
  );

  const [visibleColumns, setVisibleColumns] = useState(() => columns.map(({ id }) => id));

  // eslint-disable-next-line no-shadow
  const rowSelection = useReducer((rowSelection: any, { action, rowIndex }: any) => {
    if (action === 'add') {
      const nextRowSelection = new Set(rowSelection);
      nextRowSelection.add(rowIndex);
      return nextRowSelection;
    } else if (action === 'delete') {
      const nextRowSelection = new Set(rowSelection);
      nextRowSelection.delete(rowIndex);
      return nextRowSelection;
    } else if (action === 'clear') {
      return new Set();
    } else if (action === 'selectAll') {
      return new Set(data.data.map((_: any, index: any) => index));
    }
    return rowSelection;
  }, new Set());

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const renderCellValue = useCallback(({ rowIndex, columnId }) => data.data[rowIndex][columnId], [
    data.data,
  ]);

  return (
    <SelectionContext.Provider value={rowSelection}>
      <div>
        <EuiDataGrid
          aria-label="Top EUI contributors"
          leadingControlColumns={leadingControlColumns}
          trailingControlColumns={trailingControlColumns}
          columns={columns}
          columnVisibility={{
            visibleColumns,
            setVisibleColumns,
          }}
          rowCount={data.data.length}
          renderCellValue={renderCellValue}
          pagination={{
            ...pagination,
            pageSizeOptions: [5, 10, 15],
            onChangeItemsPerPage: setPageSize,
            onChangePage: setPageIndex,
          }}
          // Optional. Allows you to configure what features the toolbar shows.
          // The prop also accepts a boolean if you want to toggle the entire toolbar on/off.
          toolbarVisibility={{
            showColumnSelector: true,
            showStyleSelector: true,
            showSortSelector: true,
            showFullScreenSelector: false,
            additionalControls: <SelectionButton />,
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
      </div>
    </SelectionContext.Provider>
  );
};
