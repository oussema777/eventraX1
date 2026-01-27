import React from 'react';
import {
  Settings,
  BarChart,
  PieChart,
  LineChart,
  Hash,
  Check,
  Percent,
  List,
  ChevronDown
} from 'lucide-react';
import { CustomField } from './CustomFormsTab'; // Assuming CustomField is exported

// Define the simplified KPI options for non-data-savvy users
const kpiOptions = [
  {
    id: 'countOfChoices',
    label: 'How many people chose each option?',
    description: 'See how many times each option was selected. Best shown with a Bar Chart.',
    aggregationType: 'count',
    chartType: 'bar',
  },
  {
    id: 'percentageOfChoices',
    label: 'What percentage chose each option?',
    description: 'View the proportion of responses for each option. Best shown with a Pie Chart.',
    aggregationType: 'count',
    chartType: 'pie',
  },
  {
    id: 'topChoicesRanking',
    label: 'See Top 5 Most Popular Choices',
    description: 'Highlights the top 5 most frequently selected options from this list.',
    aggregationType: 'count',
    chartType: 'bar',
  },
];

export const IncludeInDashboardToggle: React.FC<IncludeInDashboardToggleProps> = ({
  field,
  onUpdateField,
}) => {
  const isChoiceField =
    field.type === 'dropdown' ||
    field.type === 'radio' ||
    field.type === 'checkbox' ||
    field.type === 'multichoice';

  if (!isChoiceField) {
    return null; // Only show for choice fields
  }

  const handleToggleInclude = () => {
    onUpdateField({
      ...field,
      includeInDashboard: !field.includeInDashboard,
      // Reset dashboard specific settings if unchecking
      ...(field.includeInDashboard && {
        dashboardLabel: undefined,
        dashboardAggregationType: undefined,
        dashboardChartType: undefined,
      }),
    });
  };

  const handleKpiChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedKpiId = e.target.value;
    const selectedKpi = kpiOptions.find(kpi => kpi.id === selectedKpiId);

    if (selectedKpi) {
      onUpdateField({
        ...field,
        dashboardAggregationType: selectedKpi.aggregationType as any,
        dashboardChartType: selectedKpi.chartType as any,
        dashboardLabel: `${field.label} - ${selectedKpi.label}`, // Suggest a label
      });
    } else {
      // If "Select KPI" is chosen (empty value)
      onUpdateField({
        ...field,
        dashboardAggregationType: undefined,
        dashboardChartType: undefined,
        dashboardLabel: field.label, // Revert to just the field label or clear
      });
    }
  };

  // Determine the currently selected KPI based on field's aggregation and chart types
  const currentKpiId = kpiOptions.find(kpi =>
    kpi.aggregationType === field.dashboardAggregationType &&
    kpi.chartType === field.dashboardChartType
  )?.id || '';


  return (
    <div
      className="flex flex-col gap-3 p-4 rounded-lg mt-4"
      style={{
        backgroundColor: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <label className="flex items-center justify-between cursor-pointer">
        <div className="flex items-center gap-2">
          <Settings size={18} style={{ color: '#94A3B8' }} />
          <span className="text-sm font-medium" style={{ color: '#FFFFFF' }}>
            Include in Dashboard
          </span>
        </div>
        <input
          type="checkbox"
          checked={field.includeInDashboard || false}
          onChange={handleToggleInclude}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
        />
      </label>

      {field.includeInDashboard && (
        <div className="space-y-4 pt-3 border-t border-gray-700">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#94A3B8' }}>
              Dashboard Label
            </label>
            <input
              type="text"
              name="dashboardLabel"
              value={field.dashboardLabel || ''}
              onChange={(e) => onUpdateField({ ...field, dashboardLabel: e.target.value })}
              placeholder={`e.g., ${field.label} Responses`}
              className="w-full h-9 px-3 rounded-lg border bg-gray-800 text-white border-gray-700 focus:border-blue-500 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#94A3B8' }}>
              Choose how to visualize this data:
            </label>
            <div className="relative flex items-center">
              <select
                value={currentKpiId}
                onChange={handleKpiChange}
                className="block w-full h-9 pl-3 pr-8 rounded-lg border bg-gray-800 text-white border-gray-700 focus:border-blue-500 outline-none appearance-none text-sm cursor-pointer"
                style={{
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                }}
              >
                <option value="">Select an option</option>
                {kpiOptions.map((kpi) => (
                  <option key={kpi.id} value={kpi.id}>
                    {kpi.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <ChevronDown size={16} />
              </div>
            </div>
            {currentKpiId && (
                <p className="text-xs text-gray-500 mt-1">
                    {kpiOptions.find(kpi => kpi.id === currentKpiId)?.description}
                </p>
            )}
          </div>

          {/* This section for inferred types can be removed for a cleaner UI if desired */}
          {(field.dashboardAggregationType || field.dashboardChartType) && (
            <div className="flex gap-2 text-xs" style={{ color: '#94A3B8' }}>
              <span>(Internal:</span>
              {field.dashboardAggregationType && (
                <span className="px-2 py-0.5 rounded bg-gray-700 text-gray-300">
                  Agg: {field.dashboardAggregationType}
                </span>
              )}
              {field.dashboardChartType && (
                <span className="px-2 py-0.5 rounded bg-gray-700 text-gray-300">
                  Chart: {field.dashboardChartType}
                </span>
              )}
              <span>)</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
