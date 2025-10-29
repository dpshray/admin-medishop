import {Alert, AlertDescription} from "@/components/ui/alert";
import {AlertCircle} from "lucide-react";

export default function ErrorState({message}: { message: string }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-100">
            <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 max-w-6xl">
                <Alert variant="destructive" className="shadow-lg">
                    <AlertCircle className="h-4 w-4"/>
                    <AlertDescription>{message}</AlertDescription>
                </Alert>
            </div>
        </div>
    );
}