"use client"

import * as React from "react"
import { format, isValid } from "date-fns"
import { CalendarIcon } from "@radix-ui/react-icons"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/Inputs/Button"
import { Calendar } from "@/components/Inputs/Calendar"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/Layout/Dialog"
import styles from './DateRangePicker.module.scss';

interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
}

export function DateRangePicker({
  className,
  date,
  setDate
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const handleManualDateChange = (value: string, field: 'from' | 'to') => {
    const newDate = new Date(`${value}T00:00:00`);
    if (isValid(newDate)) {
      if (field === 'from') {
        setDate({ from: newDate, to: date?.to });
      } else {
        setDate({ from: date?.from, to: newDate });
      }
    }
  };

  React.useEffect(() => {
    if (date?.from && date?.to) {
      setIsOpen(false)
    }
  }, [date])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          id="date"
          variant={"outline"}
          className={cn(
            "w-[300px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, "LLL dd, y")} -{" "}
                {format(date.to, "LLL dd, y")}
              </>
            ) : (
              format(date.from, "LLL dd, y")
            )
          ) : (
            <span>Pick a date range</span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-auto">
        <DialogHeader>
          <DialogTitle>Select Date Range</DialogTitle>
          <DialogDescription>
            Select a start and end date for the dashboard data.
          </DialogDescription>
        </DialogHeader>
        <div className={styles.inputContainer}>
          <div className={styles.dateInputGroup}>
            <label htmlFor="startDate">Start Date</label>
            <input
              id="startDate"
              type="date"
              value={date?.from ? format(date.from, 'yyyy-MM-dd') : ''}
              onChange={(e) => handleManualDateChange(e.target.value, 'from')}
            />
          </div>
          <div className={styles.dateInputGroup}>
            <label htmlFor="endDate">End Date</label>
            <input
              id="endDate"
              type="date"
              value={date?.to ? format(date.to, 'yyyy-MM-dd') : ''}
              onChange={(e) => handleManualDateChange(e.target.value, 'to')}
            />
          </div>
        </div>
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={setDate}
          numberOfMonths={2}
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button onClick={() => setIsOpen(false)}>Apply</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 