'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown, Check, X } from 'lucide-react';

interface CustomDatePickerProps {
  value?: string; // Format: 'YYYY-MM-DD'
  onChange: (dateStr: string) => void;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
  className?: string;
  triggerClassName?: string;
  iconLeft?: React.ReactNode;
  disabled?: boolean;
  align?: 'left' | 'right' | 'center';
  position?: 'bottom' | 'top' | 'auto';
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const CURRENT_YEAR = new Date().getFullYear();

const getLocalDateString = (d: Date = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function CustomDatePicker({
  value,
  onChange,
  placeholder = 'Select date...',
  minDate,
  maxDate,
  className = '',
  triggerClassName = '',
  iconLeft,
  disabled = false,
  align = 'left',
  position = 'top',
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'month' | 'year' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const monthDropdownRef = useRef<HTMLDivElement>(null);
  const yearDropdownRef = useRef<HTMLDivElement>(null);
  const activeYearRef = useRef<HTMLButtonElement>(null);

  const todayStr = getLocalDateString();

  // Minimum year & month bounds based on minDate
  const minYear = minDate ? parseInt(minDate.split('-')[0], 10) : CURRENT_YEAR;
  const minMonth = minDate ? parseInt(minDate.split('-')[1], 10) - 1 : 0;
  const yearOptions = Array.from({ length: 25 }, (_, i) => minYear + i);

  // Parse initial selected date or current date
  const parsedDate = value ? new Date(value + 'T00:00:00') : null;
  const isValidDate = parsedDate && !isNaN(parsedDate.getTime());

  const initialYear = isValidDate
    ? parsedDate.getFullYear()
    : Math.max(new Date().getFullYear(), minYear);
  const initialMonth = isValidDate
    ? parsedDate.getMonth()
    : initialYear === minYear
    ? Math.max(new Date().getMonth(), minMonth)
    : new Date().getMonth();

  const [currentYear, setCurrentYear] = useState(initialYear);
  const [currentMonth, setCurrentMonth] = useState(initialMonth);

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

  // Auto-scroll to selected year when year dropdown opens
  useEffect(() => {
    if (activeDropdown === 'year' && activeYearRef.current) {
      activeYearRef.current.scrollIntoView({ block: 'nearest' });
    }
  }, [activeDropdown]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveDropdown(null);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close month/year menus when clicking outside them
  useEffect(() => {
    function handleDropdownOutsideClick(e: MouseEvent) {
      if (
        activeDropdown === 'month' &&
        monthDropdownRef.current &&
        !monthDropdownRef.current.contains(e.target as Node)
      ) {
        setActiveDropdown(null);
      }
      if (
        activeDropdown === 'year' &&
        yearDropdownRef.current &&
        !yearDropdownRef.current.contains(e.target as Node)
      ) {
        setActiveDropdown(null);
      }
    }
    if (activeDropdown) {
      document.addEventListener('mousedown', handleDropdownOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleDropdownOutsideClick);
    };
  }, [activeDropdown]);

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
    const tStr = getLocalDateString(today);
    if (isDateDisabled(tStr)) return;
    onChange(tStr);
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
        className={`w-full relative flex items-center justify-between text-xs transition-all shadow-sm ${
          iconLeft ? 'pl-10 pr-3.5' : 'px-3.5'
        } py-2.5 rounded-lg bg-slate-950/80 light:bg-white hover:bg-slate-900 light:hover:bg-slate-50 border border-white/15 light:border-slate-300 hover:border-purple-400/50 light:hover:border-purple-400 text-left cursor-pointer ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${isOpen ? 'ring-2 ring-purple-500/40 border-purple-400/80' : ''} ${triggerClassName}`}
      >
        {iconLeft && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none">
            {iconLeft}
          </div>
        )}
        <span className={formattedDisplay ? 'text-white light:text-slate-900 font-semibold' : 'text-slate-500 light:text-slate-400'}>
          {formattedDisplay || placeholder}
        </span>
        <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
          {formattedDisplay && !disabled && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="p-0.5 rounded hover:bg-white/10 light:hover:bg-slate-100 text-slate-400 hover:text-slate-200 light:hover:text-slate-800 transition-colors"
              title="Clear date"
            >
              <X className="w-3 h-3" />
            </span>
          )}
          <CalendarIcon className="w-3.5 h-3.5 text-purple-300/80 light:text-purple-600" />
        </div>
      </button>

      {/* Popover Calendar Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: position === 'top' ? 6 : -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: position === 'top' ? 6 : -6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-[120] ${positionClasses} ${alignClasses} bg-[#0c101d] light:bg-white border border-purple-500/35 light:border-slate-200 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] light:shadow-2xl backdrop-blur-2xl p-4 w-[280px] text-xs select-none`}
          >
            {/* Header: Month & Year Navigator */}
            <div className="flex items-center justify-between pb-3 border-b border-purple-400/15 light:border-slate-200">
              <div className="flex items-center gap-1.5">
                {/* Custom Month Dropdown */}
                <div className="relative" ref={monthDropdownRef}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDropdown((prev) => (prev === 'month' ? null : 'month'));
                    }}
                    className={`px-2.5 py-1 rounded-lg border text-white light:text-slate-800 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      activeDropdown === 'month'
                        ? 'bg-purple-600/30 border-purple-400 text-white light:bg-purple-50 light:text-purple-700 ring-1 ring-purple-400/50 shadow-sm'
                        : 'bg-slate-900/90 light:bg-slate-50 border-purple-500/30 light:border-slate-300 hover:border-purple-400/80 hover:bg-slate-800 light:hover:bg-slate-100 text-slate-200 light:text-slate-700'
                    }`}
                  >
                    <span>{MONTH_NAMES[currentMonth].slice(0, 3)}</span>
                    <ChevronDown
                      className={`w-3 h-3 text-purple-400 transition-transform duration-200 ${
                        activeDropdown === 'month' ? 'rotate-180 text-white light:text-purple-700' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {activeDropdown === 'month' && (
                      <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.95 }}
                        transition={{ duration: 0.12 }}
                        className="absolute left-0 top-full mt-1.5 z-40 w-36 max-h-52 overflow-y-auto rounded-xl bg-slate-950/95 light:bg-white border border-purple-500/40 light:border-slate-200 shadow-2xl backdrop-blur-2xl p-1.5 space-y-0.5 [scrollbar-width:thin] [scrollbar-color:rgba(168,85,247,0.4)_transparent] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-purple-500/40 [&::-webkit-scrollbar-thumb]:rounded-full"
                      >
                        {MONTH_NAMES.map((m, idx) => {
                          const isSelected = currentMonth === idx;
                          return (
                            <button
                              key={m}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentMonth(idx);
                                setActiveDropdown(null);
                              }}
                              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white keep-white font-bold shadow-md shadow-purple-950/50'
                                  : 'text-slate-300 light:text-slate-700 hover:text-white light:hover:text-purple-900 hover:bg-white/10 light:hover:bg-purple-50'
                              }`}
                            >
                              <span className={isSelected ? 'keep-white text-white' : ''}>{m}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-purple-200 keep-white shrink-0" />}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Custom Year Dropdown */}
                <div className="relative" ref={yearDropdownRef}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDropdown((prev) => (prev === 'year' ? null : 'year'));
                    }}
                    className={`px-2.5 py-1 rounded-lg border text-white light:text-slate-800 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      activeDropdown === 'year'
                        ? 'bg-purple-600/30 border-purple-400 text-white light:bg-purple-50 light:text-purple-700 ring-1 ring-purple-400/50 shadow-sm'
                        : 'bg-slate-900/90 light:bg-slate-50 border-purple-500/30 light:border-slate-300 hover:border-purple-400/80 hover:bg-slate-800 light:hover:bg-slate-100 text-slate-200 light:text-slate-700'
                    }`}
                  >
                    <span>{currentYear}</span>
                    <ChevronDown
                      className={`w-3 h-3 text-purple-400 transition-transform duration-200 ${
                        activeDropdown === 'year' ? 'rotate-180 text-white light:text-purple-700' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {activeDropdown === 'year' && (
                      <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.95 }}
                        transition={{ duration: 0.12 }}
                        className="absolute left-0 top-full mt-1.5 z-40 w-28 max-h-52 overflow-y-auto rounded-xl bg-slate-950/95 light:bg-white border border-purple-500/40 light:border-slate-200 shadow-2xl backdrop-blur-2xl p-1.5 space-y-0.5 [scrollbar-width:thin] [scrollbar-color:rgba(168,85,247,0.4)_transparent] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-purple-500/40 [&::-webkit-scrollbar-thumb]:rounded-full"
                      >
                        {yearOptions.map((y) => {
                          const isSelected = currentYear === y;
                          return (
                            <button
                              key={y}
                              ref={isSelected ? activeYearRef : undefined}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentYear(y);
                                setActiveDropdown(null);
                              }}
                              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white keep-white font-bold shadow-md shadow-purple-950/50'
                                  : 'text-slate-300 light:text-slate-700 hover:text-white light:hover:text-purple-900 hover:bg-white/10 light:hover:bg-purple-50'
                              }`}
                            >
                              <span className={isSelected ? 'keep-white text-white' : ''}>{y}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-purple-200 keep-white shrink-0" />}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1 rounded-lg hover:bg-slate-800 light:hover:bg-slate-100 text-slate-400 light:text-slate-600 hover:text-white light:hover:text-slate-900 transition-colors cursor-pointer"
                  title="Previous month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 rounded-lg hover:bg-slate-800 light:hover:bg-slate-100 text-slate-400 light:text-slate-600 hover:text-white light:hover:text-slate-900 transition-colors cursor-pointer"
                  title="Next month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Day of Week Headers */}
            <div className="grid grid-cols-7 gap-1 text-center pt-2 pb-1">
              {DAY_LABELS.map((d) => (
                <span key={d} className="text-[10px] font-bold text-purple-300/60 light:text-slate-500 uppercase">
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
                      className="h-7 w-7 rounded-xl mx-auto flex items-center justify-center text-[11px] font-medium invisible pointer-events-none select-none"
                      aria-hidden="true"
                    />
                  );
                }

                return (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => handleSelectDay(item.fullDateStr, item.isDisabled)}
                    className={`h-7 w-7 rounded-xl mx-auto flex items-center justify-center text-[11px] font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-600 border border-purple-400 text-white keep-white shadow-[0_0_12px_rgba(168,85,247,0.5)] font-bold'
                        : isToday
                        ? 'bg-slate-800 light:bg-purple-50 text-purple-300 light:text-purple-700 border border-purple-400/30 light:border-purple-300 font-bold'
                        : isCurrentMonth
                        ? 'text-slate-200 light:text-slate-800 hover:bg-purple-500/20 light:hover:bg-purple-50 hover:text-white light:hover:text-purple-900'
                        : 'text-slate-500 light:text-slate-400 hover:text-slate-300 light:hover:text-slate-600'
                    }`}
                  >
                    <span className={isSelected ? 'keep-white text-white' : ''}>{item.day}</span>
                  </button>
                );
              })}
            </div>

            {/* Footer Actions: Clear & Today */}
            <div className="flex items-center justify-between pt-3 mt-2 border-t border-purple-400/15 light:border-slate-200">
              <button
                type="button"
                onClick={handleClear}
                className="text-[11px] font-bold text-slate-400 light:text-slate-600 hover:text-rose-400 light:hover:text-rose-600 transition-colors cursor-pointer"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleSetToday}
                disabled={isDateDisabled(todayStr)}
                className="text-[11px] font-bold text-purple-300 light:text-purple-700 hover:text-purple-100 light:hover:text-purple-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
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

