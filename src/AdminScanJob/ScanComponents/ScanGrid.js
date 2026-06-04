import React, { forwardRef, useMemo, useCallback } from "react";
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Sort,
  Inject,
  Toolbar,
  Filter,
  Resize,
  VirtualScroll,
} from "@syncfusion/ej2-react-grids";
import { emptyMessageTemplate } from "../utils/scanUtils";

const SERVICES = [Sort, Toolbar, Filter, Resize, VirtualScroll];

// const TOOLBAR = ["ExcelExport", "CsvExport"];
const EDIT_SETTINGS = {
  allowEditing: true,
  allowAdding: true,
  allowDeleting: true,
};
// const FILTER_SETTINGS = { type: "Excel" };

// FIX: page settings required for virtualisation
const PAGE_SETTINGS = { pageSize: 50 };

const ScanGrid = forwardRef(function ScanGrid(
  {
    dataSource,
    headData,
    borderRowId,
    onRowSelected,
    onCellSelected,
    onActionComplete,
    onDataBound,
    onClick,
    onToolbarClick,
  },
  ref,
) {
  const rowDataBound = useCallback(
    (args) => {
      const row = args.data;

      // Reset styles
      Object.assign(args.row.style, {
        border: "",
        boxShadow: "",
        borderRadius: "",
        backgroundColor: "",
        color: "",
      });

      if (row?.FileName === borderRowId) {
        args.row.style.backgroundColor = "#d4d4d4";
        args.row.style.borderRadius = "10px";
      }

      if (row?.Success === "False") {
        args.row.style.backgroundColor = "#f8d7da";
        args.row.style.color = "#721c24";
      }

      const hasEmpty = Object.values(row).some((v) => v === null || v === "");
      if (!hasEmpty) return;

      Object.keys(row).forEach((key) => {
        if (row[key] === null || row[key] === "") {
          const idx = Array.from(args.row.cells).findIndex(
            (cell) => cell.column?.field === key,
          );
          if (idx !== -1) args.row.cells[idx].style.backgroundColor = "yellow";
        }
      });
    },
    [borderRowId],
  ); // only re-created when selected row changes

  const columns = useMemo(
    () =>
      headData.map((field) => (
        // FIX: key={field} instead of key={index} so unchanged columns aren't touched
        <ColumnDirective
          key={field}
          field={field}
          headerText={field}
          width="120"
          textAlign="Center"
        />
      )),
    [headData], // only re-runs when column list changes (once per scan start)
  );

  return (
    <GridComponent
      ref={ref}
      dataSource={dataSource}
      enableVirtualization={true}
      enableColumnVirtualization={true}
      height={550}
      // height={gridHeight}
      onClick={onClick}
      dataBound={onDataBound}
      actionComplete={onActionComplete}
      allowSorting={false}
      allowFiltering={false}
      allowResizing={true}
      // allowExcelExport={true}
      allowPdfExport={false}
      editSettings={EDIT_SETTINGS}
      // filterSettings={FILTER_SETTINGS}
      // toolbar={TOOLBAR}
      toolbarClick={onToolbarClick}
      selectionSettings={{ mode: "Row", type: "Single" }}
      rowDataBound={rowDataBound}
      rowSelected={onRowSelected}
      cellSelected={onCellSelected}
      emptyRecordTemplate={emptyMessageTemplate}
      pageSettings={PAGE_SETTINGS}
    >
      <ColumnsDirective>{columns}</ColumnsDirective>
      <Inject services={SERVICES} />
    </GridComponent>
  );
});

export default ScanGrid;
