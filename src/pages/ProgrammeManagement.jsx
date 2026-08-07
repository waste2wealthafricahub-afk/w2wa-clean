import ProgrammeOverview from "../components/programme/ProgrammeOverview";
import EMCCCSchoolsTable from "../components/programme/EMCCCSchoolsTable";
import ActivityApprovalQueue from "../components/programme/ActivityApprovalQueue";
import CompliancePanel from "../components/programme/CompliancePanel";
import ProgrammeAnalytics from "../components/programme/ProgrammeAnalytics";

export default function ProgrammeManagement() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Programme Management Centre</h1>

      <ProgrammeOverview />

      <EMCCCSchoolsTable />

      <ActivityApprovalQueue />

      <CompliancePanel />

      <ProgrammeAnalytics />
    </div>
  );
}