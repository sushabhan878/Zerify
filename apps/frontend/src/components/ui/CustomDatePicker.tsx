'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface CustomDatePickerProps {
  value?: string; // Format: 'YYYY-MM-DD'
  onChange: (dateStr: string) => void;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
  className?: string;
  disabled?: boolean;
  align?: 'left' | 'right' | 'center';
  position?: 'bottom' | 'top' | 'auto';
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function CustomDatePicker({
  value,
  onChange,
  placeholder = 'Select date...',
  minDate,
  maxDate,
  className = '',
  disabled = false,
  align = 'left',
  position = 'bottom',
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial selected date or current date
  const parsedDate = value ? new Date(value + 'T00:00:00') : null;
  const isValidDate = parsedDate && !isNaN(parsedDate.getTime());

  const [currentYear, setCurrentYear] = useState(
    isValidDate ? parsedDate.getFullYear() : new Date().getFullYear(),
  );
  const [currentMonth, setCurrentMonth] = useState(
    isValidDate ? parsedDate.getMonth() : new Date().getMonth(),
  );

  // Sync year/month when value changes
  useEffect(() => {
    if (value) {
      const d = new Date(value + 'T00:00:00');
      if (!isNaN(d.getTime())) {
        setCurrentYear(d.getFullYear());
        setCurrentMonth(d.getMonth());
      }
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Generate calendar grid days
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const calendarDays: { day: number; monthOffset: number; fullDateStr: string; isDisabled: boolean }[] = [];

  const isDateDisabled = (dateStr: string) => {
    if (minDate && dateStr < minDate) return true;
    if (maxDate && dateStr > maxDate) return true;
    return false;
  };

  // Previous month trailing days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarDays.push({ day: d, monthOffset: -1, fullDateStr: dateStr, isDisabled: isDateDisabled(dateStr) });
  }

  // Current month days
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarDays.push({ day: d, monthOffset: 0, fullDateStr: dateStr, isDisabled: isDateDisabled(dateStr) });
  }

  // Next month leading days (to fill 35 or 42 grid cells)
  const remainingCells = 42 - calendarDays.length;
  if (remainingCells > 0 && calendarDays.length <= 35) {
    const limit = 35 - calendarDays.length;
    for (let d = 1; d <= limit; d++) {
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      calendarDays.push({ day: d, monthOffset: 1, fullDateStr: dateStr, isDisabled: isDateDisabled(dateStr) });
    }
  }

  const handleSelectDay = (dateStr: string, isDisabled: boolean) => {
    if (isDisabled) return;
    onChange(dateStr);
    setIsOpen(false);
  };

  const handleSetToday = () => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    if (isDateDisabled(todayStr)) return;
    onChange(todayStr);
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  // Formatted display text (e.g., '23 Aug 2026')
  const formattedDisplay = isValidDate
    ? parsedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

  const todayStr = new Date().toISOString().split('T')[0];

  // Positioning classes
  const positionClasses = position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2';
  const alignClasses =
    align === 'right'
      ? 'right-0 left-auto'
      : align === 'center'
      ? 'left-1/2 -translate-x-1/2'
      : 'left-0 right-auto';

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Date Trigger Input */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full px-3.5 py-2.5 bg-slate-900/90 hover:bg-slate-900 border border-purple-400/25 hover:border-purple-400/50 rounded-xl text-xs flex items-center justify-between text-left transition-all shadow-sm ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        } ${isOpen ? 'ring-2 ring-purple-500/40 border-purple-400' : ''}`}
      >
        <span className={formattedDisplay ? 'text-white font-medium' : 'text-slate-500'}>
          {formattedDisplay || placeholder}
        </span>
        <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
          {formattedDisplay && !disabled && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="p-0.5 rounded hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors"
              title="Clear date"
            >
              <X className="w-3 h-3" />
            </span>
          )}
          <CalendarIcon className="w-3.5 h-3.5 text-purple-300/80" />
        </div>
      </button>

      {/* Popover Calendar Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: position === 'top' ? -6 : 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: position === 'top' ? -6 : 6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-[100] ${positionClasses} ${alignClasses} bg-[#0c101d] border border-purple-500/35 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] backdrop-blur-2xl p-4 w-[280px] text-xs select-none`}
          >
            {/* Header: Month & Year Navigator */}
            <div className="flex items-center justify-between pb-3 border-b border-purple-400/15">
              <span className="font-extrabold text-white text-xs tracking-wide">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Day of Week Headers */}
            <div className="grid grid-cols-7 gap-1 text-center pt-2 pb-1">
              {DAY_LABELS.map((d) => (
                <span key={d} className="text-[10px] font-bold text-purple-300/60 uppercase">
                  {d}
                </span>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {calendarDays.map((item, idx) => {
                const isSelected = value === item.fullDateStr;
                const isToday = todayStr === item.fullDateStr;
                const isCurrentMonth = item.monthOffset === 0;

                if (item.isDisabled) {
                  return (
                    <span
                      key={idx}
                      className="h-7 w-7 rounded-xl mx-auto flex items-center justify-center text-[11px] font-medium text-slate-700 opacity-40 cursor-not-allowed"
                    >
                      {item.day}
                    </span>
                  );
                }

                return (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => handleSelectDay(item.fullDateStr, item.isDisabled)}
                    className={`h-7 w-7 rounded-xl mx-auto flex items-center justify-center text-[11px] font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-600 border border-purple-400 text-white shadow-[0_0_12px_rgba(168,85,247,0.5)] font-bold'
                        : isToday
                        ? 'bg-slate-800 text-purple-300 border border-purple-400/30 font-bold'
                        : isCurrentMonth
                        ? 'text-slate-200 hover:bg-purple-500/20 hover:text-white'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {item.day}
                  </button>
                );
              })}
            </div>

            {/* Footer Actions: Clear & Today */}
            <div className="flex items-center justify-between pt-3 mt-2 border-t border-purple-400/15">
              <button
                type="button"
                onClick={handleClear}
                className="text-[11px] font-bold text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleSetToday}
                disabled={isDateDisabled(todayStr)}
                className="text-[11px] font-bold text-purple-300 hover:text-purple-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                Today
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

