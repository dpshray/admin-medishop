import { memo } from "react";
import { Truck } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import SearchSelectField from "@/components/field/search-select";
import TextInput from "@/components/field/text-input";
import { useAssignNcm, useAssignVendorNcm } from "@/hooks/useOrder";
import { FormatDate } from "@/lib/helper";

interface NcmOrder {
  ncm_order_id: string;
  delivery_type: string;
  fbranch: string;
  tbranch: string;
  package: string;
  weight: string;
  cod_charge: string;
  delivery_charge: string;
  created_at: string;
  instruction?: string;
  delivery_status: string;
}

interface NcmAssignmentSectionProps {
  ncmOrder?: NcmOrder | null;
  orderUuid: string;
  onSuccess: () => void;
  branchOptions: { value: string | number; label: string }[];
  userRole?: "admin" | "vendor";
}

const deliveryTypes = [
  { label: "Door to Door", value: "Door2Door" },
  { label: "Branch to Door", value: "Branch2Door" },
  { label: "Branch to Branch", value: "Branch2Branch" },
  { label: "Door to Branch", value: "Door2Branch" },
];

const orderFormSchema = z.object({
  fbranch: z.string().min(1, "Please select from branch"),
  tbranch: z.string().min(1, "Please select to branch"),
  delivery_type: z.string().min(1, "Please select delivery type"),
  weight: z.string().min(1, "Please enter weight"),
  package: z.string().min(1, "Please enter package name"),
  instruction: z.string().optional(),
});

type NcmFormValues = z.infer<typeof orderFormSchema>;

const NcmAssignmentSection = memo(
  ({
    ncmOrder,
    orderUuid,
    onSuccess,
    branchOptions,
    userRole = "admin",
  }: NcmAssignmentSectionProps) => {
    const isNcmAssigned = !!ncmOrder;
    const adminMutation = useAssignNcm();
    const vendorMutation = useAssignVendorNcm();

    const { mutate: assignNcm, isPending } =
      userRole === "vendor" ? vendorMutation : adminMutation;

    const {
      register,
      setValue,
      watch,
      handleSubmit,
      formState: { errors },
    } = useForm<NcmFormValues>({
      resolver: zodResolver(orderFormSchema),
      defaultValues: {
        delivery_type: "",
        fbranch: "",
        tbranch: "",
        weight: "",
        package: "",
        instruction: "",
      },
    });

    const deliveryTypeValue = watch("delivery_type");
    const fbranchValue = watch("fbranch");
    const tbranchValue = watch("tbranch");
    // console.log("ooooooo", branchOptions)

    const handleFormSubmit = handleSubmit((values) => {
      assignNcm(
        { order_uuid: orderUuid, data: values },
        {
          onSuccess: () => {
            onSuccess();
          },
        },
      );
    });

    return (
      <section className="space-y-3" aria-labelledby="ncm-assignment-heading">
        <h3
          id="ncm-assignment-heading"
          className="font-semibold text-sm sm:text-base flex items-center gap-2"
        >
          <Truck
            className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600"
            aria-hidden="true"
          />
          Assign to NCM Courier
        </h3>

        <div className="border rounded-lg overflow-hidden">
          {/* Header bar */}
          <div className="bg-gradient-to-r from-purple-50/50 to-primary/5 px-4 py-3 border-b border-slate-200 flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
              <Truck className="h-4 w-4 text-purple-600" />
            </div>
            <span className="text-sm font-semibold text-slate-700">
              Delivery &amp; Courier Details
            </span>
          </div>

          {!isNcmAssigned ? (
            <div className="p-4 space-y-4 bg-purple-50/20">
              <div className="grid sm:grid-cols-2 gap-4">
                <SearchSelectField
                  label="Delivery Type"
                  options={deliveryTypes}
                  placeholder="Select Delivery Type..."
                  error={(errors as any).delivery_type?.message}
                  onChange={(value) => setValue("delivery_type", String(value))}
                  value={deliveryTypeValue}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <SearchSelectField
                  label="From Branch"
                  options={branchOptions}
                  placeholder="Select From Branch..."
                  error={(errors as any).fbranch?.message}
                  onChange={(value) => {
                    const branch = branchOptions.find((b) => b.value === value);
                    if (branch) {
                      setValue("fbranch", branch.label);
                    }
                  }}
                  value={
                    branchOptions.find((b) => b.label === fbranchValue)
                      ?.value ?? ""
                  }
                />

                <SearchSelectField
                  label="To Branch"
                  options={branchOptions}
                  placeholder="Select To Branch..."
                  error={(errors as any).tbranch?.message}
                  onChange={(value) => {
                    const branch = branchOptions.find((b) => b.value === value);
                    if (branch) {
                      setValue("tbranch", branch.label);
                    }
                  }}
                  value={
                    branchOptions.find((b) => b.label === tbranchValue)
                      ?.value ?? ""
                  }
                />

                <TextInput
                  label="Weight (in kg)"
                  placeholder="Enter weight in kg"
                  {...register("weight")}
                  error={errors.weight?.message}
                />

                <TextInput
                  label="Package Name"
                  placeholder="Enter package name"
                  {...register("package")}
                  error={errors.package?.message}
                />
              </div>

              <TextInput
                label="Special Instructions"
                textarea
                placeholder="Enter special instructions"
                {...register("instruction")}
                error={errors.instruction?.message}
                className="bg-white"
              />

              <div className="flex justify-end pt-1">
                <Button
                  onClick={handleFormSubmit}
                  disabled={isPending}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm"
                  size="sm"
                >
                  <Truck
                    className="h-3 w-3 sm:h-4 sm:w-4 mr-1"
                    aria-hidden="true"
                  />
                  {isPending ? "Assigning..." : "Assign to NCM"}
                </Button>
              </div>
            </div>
          ) : (
            /* Already assigned — show read-only NCM details */
            <div className="p-4 bg-green-50/40">
              <h4 className="text-sm font-semibold text-green-900 mb-3">
                NCM Delivery Details
              </h4>

              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                {ncmOrder!.ncm_order_id && (
                  <div>
                    <p className="text-slate-500 text-xs">NCM Order ID</p>
                    <p className="font-semibold">{ncmOrder!.ncm_order_id}</p>
                  </div>
                )}

                <div>
                  <p className="text-slate-500 text-xs">Delivery Type</p>
                  <p className="font-semibold">
                    {deliveryTypes.find(
                      (d) => d.value === ncmOrder!.delivery_type,
                    )?.label ?? ncmOrder!.delivery_type}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500 text-xs">From Branch</p>
                  <p className="font-semibold">{ncmOrder!.fbranch}</p>
                </div>

                <div>
                  <p className="text-slate-500 text-xs">To Branch</p>
                  <p className="font-semibold">{ncmOrder!.tbranch}</p>
                </div>

                <div>
                  <p className="text-slate-500 text-xs">Package</p>
                  <p className="font-semibold">{ncmOrder!.package}</p>
                </div>

                <div>
                  <p className="text-slate-500 text-xs">Weight</p>
                  <p className="font-semibold">{ncmOrder!.weight} kg</p>
                </div>

                <div>
                  <p className="text-slate-500 text-xs">COD Charge</p>
                  <p className="font-semibold">Rs. {ncmOrder!.cod_charge}</p>
                </div>

                <div>
                  <p className="text-slate-500 text-xs">Delivery Charge</p>
                  <p className="font-semibold">
                    Rs. {ncmOrder!.delivery_charge}
                  </p>
                </div>

                {ncmOrder!.instruction && (
                  <div className="sm:col-span-2">
                    <p className="text-slate-500 text-xs">Instruction</p>
                    <p className="font-semibold">{ncmOrder!.instruction}</p>
                  </div>
                )}

                <div className="sm:col-span-2 flex items-center justify-between">
                  <span className="inline-flex px-3 py-1 rounded-lg text-xs font-semibold bg-green-100 text-green-800">
                    {ncmOrder!.delivery_status}
                  </span>
                  <p className="text-xs text-slate-400">
                    {FormatDate(ncmOrder!.created_at)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    );
  },
);

NcmAssignmentSection.displayName = "NcmAssignmentSection";

export default NcmAssignmentSection;
