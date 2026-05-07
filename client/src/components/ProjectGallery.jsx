import { useMemo } from "react";
import { Image, Video, FileText, Download, ExternalLink, Search } from "lucide-react";

export default function ProjectGallery({ tasks }) {
    const media = useMemo(() => {
        const allMedia = [];
        tasks.forEach(task => {
            if (task.attachments) {
                task.attachments.forEach(att => {
                    allMedia.push({
                        ...att,
                        taskTitle: task.title,
                        taskId: task.id
                    });
                });
            }
        });
        return allMedia.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [tasks]);

    if (media.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-500 bg-zinc-50/50 dark:bg-zinc-900/20 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-full mb-4">
                    <Image className="size-8 opacity-20" />
                </div>
                <h3 className="text-lg font-bold">No media found</h3>
                <p className="text-sm">Attach images or videos to tasks to see them here.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Gallery Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {media.map((item) => (
                    <div key={item.id} className="group relative bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:shadow-xl transition-all">
                        {/* Preview */}
                        <div className="aspect-square bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center overflow-hidden">
                            {item.type === "IMAGE" ? (
                                <img src={item.url} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            ) : item.type === "VIDEO" ? (
                                <div className="relative w-full h-full">
                                    <video src={item.url} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                        <Video className="size-8 text-white drop-shadow-lg" />
                                    </div>
                                </div>
                            ) : (
                                <FileText className="size-12 text-zinc-400" />
                            )}

                            {/* Hover Actions */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                <a href={item.url} target="_blank" rel="noreferrer" className="p-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-md text-white transition-colors">
                                    <ExternalLink className="size-5" />
                                </a>
                                <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-md text-white transition-colors">
                                    <Download className="size-5" />
                                </button>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="p-3">
                            <p className="text-xs font-bold truncate mb-0.5">{item.name}</p>
                            <p className="text-[10px] text-zinc-500 truncate">From: <span className="text-blue-500">{item.taskTitle}</span></p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
