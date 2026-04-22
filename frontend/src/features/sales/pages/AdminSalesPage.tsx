import Button from '../../../shared/components/ui/Button'
import OrderReceiptSheet from '../../../shared/components/receipt/OrderReceiptSheet'
import { formatCurrency } from '../../../shared/lib/format'
import SalesFilterBar from '../components/SalesFilterBar'
import SalesRecordDetailsModal from '../components/SalesRecordDetailsModal'
import SalesRecordsTable from '../components/SalesRecordsTable'
import SalesStatsCards from '../components/SalesStatsCards'
import useAdminSalesPageController from '../useAdminSalesPageController'

function AdminSalesPage() {
  const {
    endDate,
    methodFilter,
    methodOptions,
    model,
    printOrder,
    query,
    selectedRecord,
    startDate,
    statusFilter,
    statusOptions,
    handleBackToSales,
    handleCloseDetails,
    handleEndDateChange,
    handleExport,
    handleMethodFilterChange,
    handlePrint,
    handleQueryChange,
    handleSelectRecord,
    handleStartDateChange,
    handleStatusFilterChange,
  } = useAdminSalesPageController()

  return (
    <div className="page admin-page admin-sales-page">
      <div className="page-header">
        <div>
          <h2>Sales Records</h2>
          <p className="muted">Track payments, profit, and cashier performance.</p>
        </div>
        <div className="admin-actions">
          <Button variant="outline" onClick={handleBackToSales}>
            Back to Sales
          </Button>
        </div>
      </div>

      <SalesFilterBar
        query={query}
        methodFilter={methodFilter}
        statusFilter={statusFilter}
        startDate={startDate}
        endDate={endDate}
        methodOptions={methodOptions}
        statusOptions={statusOptions}
        onQueryChange={handleQueryChange}
        onMethodFilterChange={handleMethodFilterChange}
        onStatusFilterChange={handleStatusFilterChange}
        onStartDateChange={handleStartDateChange}
        onEndDateChange={handleEndDateChange}
        onExport={handleExport}
      />

      <SalesStatsCards metrics={model.metrics} formatCurrency={formatCurrency} />

      <SalesRecordsTable
        records={model.sorted}
        getUiStatus={model.getUiStatus}
        onSelect={handleSelectRecord}
        onPrint={handlePrint}
      />

      <SalesRecordDetailsModal record={selectedRecord} onClose={handleCloseDetails} onPrint={handlePrint} />

      {printOrder ? <OrderReceiptSheet order={printOrder} variant="receipt" /> : null}
    </div>
  )
}

export default AdminSalesPage
