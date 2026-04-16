import ManagementLayout from "@/components/management/ManagementLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ManagementModuleUnavailableProps = {
  currentPageName: string;
  title: string;
};

export default function ManagementModuleUnavailable({
  currentPageName,
  title,
}: ManagementModuleUnavailableProps) {
  return (
    <ManagementLayout currentPageName={currentPageName}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="mt-2 text-slate-600">
            This module is intentionally offline until its backend, auth, and
            verification path are fully wired.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Temporarily disabled for safety</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <p>
              The previous version exposed routes that looked live before the
              underlying APIs and server-side authorization were reliable.
            </p>
            <p>
              Keeping this module offline is safer than showing a page that can
              crash, leak false confidence, or accept changes without a trusted
              backend path.
            </p>
          </CardContent>
        </Card>
      </div>
    </ManagementLayout>
  );
}
