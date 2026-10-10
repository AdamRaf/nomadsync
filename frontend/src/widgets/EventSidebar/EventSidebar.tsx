import { useState } from "react";
import type { ItineraryEvent } from "../../entities/event/types";
import './EventSidebar.css'
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button"

interface EventSidebarProps {
  events: ItineraryEvent[];
  handleSubmit: (e: React.SubmitEvent) => void;
  newEventTitle: string;
  setNewEventTitle: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  activeLat: number | '';
  activeLng: number | '';
  setActiveLat: React.Dispatch<React.SetStateAction<number | "">>;
  setActiveLng: React.Dispatch<React.SetStateAction<number | "">>;
  editngId: number | null;
  editTitle: string;
  setEditTitle: React.Dispatch<React.SetStateAction<string>>;
  handleUpdate: (id: number, start_time: string) => void;
  setEditingId: React.Dispatch<React.SetStateAction<number | null>>;
  handleDelete: (id: number) => void;
}

export const EventSidebar = (props: EventSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const appVersion = import.meta.env.VITE_APP_VERSION || 'v0.0.0';
  
  const sortedEvents = [...props.events].sort((a, b) => (
    a.start_time.localeCompare(b.start_time)
  ))

  return (
    <div className={`event-sidebar-wrapper ${isCollapsed ? 'collapsed' : ''}`}>
      <button
        className="sidebar-toggle-btn absolute z-50 bg-slate-800 text-white p-2 rounded-r-md top-4 -right-10 shadow-md"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? '>>' : '<<'}
      </button>
      <div className={`event-sidebar bg-slate-50 h-full p-4 flex flex-col gap-4 overflow-y-auto ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h1 className="test-x1 font-bold text-slate-900 tracking-tight">Nomadsync</h1>
            <p className="text-xs font-mono text-slate-500 bg-slate-200 px-2 py-0.5 rounded">{appVersion}</p>
          </div>
        </div>

        <Card className="shadow-sm border-slate-200 shrink-0">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Create New Event</CardTitle>
          </CardHeader>

          <CardContent className="p-4 pt-0">
            <form className="flex flex-col gap-3" onSubmit={props.handleSubmit}>
              <Input
                type="text"
                value={props.newEventTitle}
                onChange={(e) => props.setNewEventTitle(e.target.value)}
                placeholder="Flight to Mars"
                disabled={props.loading}
                className="text-sm"
              />

              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  value={props.activeLat}
                  onChange={(e) => props.setActiveLat(Number(e.target.value))}
                  placeholder="Lat"
                  disabled={props.loading}
                  step="any"
                  className="text-sm"
                />
                <Input
                  type="number"
                  value={props.activeLng}
                  onChange={(e) => props.setActiveLng(Number(e.target.value))}
                  placeholder="Lng"
                  disabled={props.loading}
                  step="any"
                  className="text-sm"
                />
              </div>

              <Button
                type="submit"
                disabled={props.loading || !props.newEventTitle}
                className="w-full h-10 font-medium"
              >
                {props.loading ? 'Saving...' : 'Save'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <ul className="flex flex-col gap-3">
          {sortedEvents.map((event) => (
            <Card key={event.id} className="shadow-sm border-slate-200 transition-all hover:border-slate-300">
              <CardContent className="p-4">
                {props.editngId === event.id ? (
                  <div className="flex flex-col gap-2">
                    <Input
                      type="text"
                      value={props.editTitle}
                      onChange={(e) => props.setEditTitle(e.target.value)}
                      className="text-sm"
                    />
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" onClick={() => props.handleUpdate(event.id, event.start_time)}>Save</Button>
                      <Button size="sm" variant="outline" onClick={() => props.setEditingId(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-2">
                      <div>
                        <h3 className="font-semibold text-slate-900 text-sm leading-snug">{event.title}</h3>
                        <p className="text-xs text-slate-500 mt-1">{new Date(event.start_time).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          props.setEditingId(event.id);
                          props.setEditTitle(event.title);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => props.handleDelete(event.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </ul>
      </div>
    </div>
  )
}
