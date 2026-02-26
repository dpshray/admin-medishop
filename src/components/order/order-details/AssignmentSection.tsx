import { memo } from "react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AssignmentSectionProps {
    title: string
    icon: any
    selectedCount: number
    onAssign: () => void
    disabled: boolean
    children?: React.ReactNode
    colorScheme: "blue" | "green"
}

const colors = {
    blue: {
        icon: "text-blue-600",
        bg: "bg-blue-50/50",
        button: "bg-blue-600 hover:bg-blue-700",
    },
    green: {
        icon: "text-green-600",
        bg: "bg-green-50/50",
        button: "bg-green-600 hover:bg-green-700",
    },
}

const AssignmentSection = memo(({
    title,
    icon: Icon,
    selectedCount,
    onAssign,
    disabled,
    children,
    colorScheme,
}: AssignmentSectionProps) => {
    const scheme = colors[colorScheme]

    return (
        <section className="space-y-3" aria-labelledby={`${colorScheme}-assignment-heading`}>
            <h3
                id={`${colorScheme}-assignment-heading`}
                className="font-semibold text-sm sm:text-base flex items-center gap-2"
            >
                <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5", scheme.icon)} aria-hidden="true" />
                {title}
            </h3>

            <div className={cn("p-3 sm:p-4 border rounded-lg space-y-3", scheme.bg)}>
                {children}

                <div className="flex justify-between items-center gap-2 flex-wrap">
                    <p className="text-xs sm:text-sm text-muted-foreground" aria-live="polite">
                        {selectedCount > 0
                            ? `${selectedCount} item${selectedCount > 1 ? "s" : ""} selected`
                            : "Select items to assign"}
                    </p>

                    <Button
                        size="sm"
                        className={cn("text-white text-xs sm:text-sm", scheme.button)}
                        disabled={disabled}
                        onClick={onAssign}
                        aria-label={`Assign ${selectedCount} selected item${selectedCount > 1 ? "s" : ""}`}
                    >
                        <Check className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                        <span className="ml-1">Assign</span>
                        {selectedCount > 0 && <span className="ml-1">({selectedCount})</span>}
                    </Button>
                </div>
            </div>
        </section>
    )
})

AssignmentSection.displayName = "AssignmentSection"

export default AssignmentSection