import VendorOrderTable from "@/components/vendor/vendor-order-table";

export default function VendorOrderPage() {
  return (
    <div className={"min-h-screen mainContainer"}>
      <div className={"mt-6  my-2"}>
        <VendorOrderTable />
      </div>
    </div>
  );
}
