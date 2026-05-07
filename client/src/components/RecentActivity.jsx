import ProjectActivity from "./ProjectActivity";
import { useSelector } from "react-redux";

const RecentActivity = () => {
    const currentWorkspace = useSelector((state) => state?.workspace?.currentWorkspace || null);

    if (!currentWorkspace) return null;

    return (
        <div className="max-h-[600px] overflow-y-auto no-scrollbar py-4 px-2">
            <ProjectActivity workspaceId={currentWorkspace.id} />
        </div>
    );
}

export default RecentActivity;
