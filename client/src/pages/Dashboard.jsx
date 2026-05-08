import { Plus } from 'lucide-react'
import { useState } from 'react'
import StatsGrid from '../components/StatsGrid'
import ProjectOverview from '../components/ProjectOverview'
import RecentActivity from '../components/RecentActivity'
import TasksSummary from '../components/TasksSummary'
import CreateProjectDialog from '../components/CreateProjectDialog'
import {useUser} from "@clerk/clerk-react"

const Dashboard = () => {

    const {user} = useUser()
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    return (
        <div className='max-w-7xl mx-auto space-y-10 py-6'>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-fade-in">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-500 bg-clip-text text-transparent mb-1">
                        Welcome back, {user?.firstName || 'User'}
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                        Here's your productivity overview for today.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setIsDialogOpen(true)} 
                        className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                    >
                        <Plus size={18} /> New Project
                    </button>
                </div>

            </div>
            <CreateProjectDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />


            {/* Main Stats */}
            <StatsGrid />

            {/* Dashboard Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Projects & Activities */}
                <div className="lg:col-span-8 space-y-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <ProjectOverview />
                    <div className="bg-white dark:bg-zinc-950/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 overflow-hidden">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-6 px-2">Recent Activity</h3>
                        <RecentActivity />
                    </div>
                </div>

                {/* Right Column: Personal Tasks & Calendar */}
                <div className="lg:col-span-4 space-y-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <TasksSummary />
                </div>
            </div>
        </div>
    )
}

export default Dashboard
