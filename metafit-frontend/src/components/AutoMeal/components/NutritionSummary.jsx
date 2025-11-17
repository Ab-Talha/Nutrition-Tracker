// src/components/AutoMeal/components/NutritionSummary.jsx

import React, { useState } from 'react';

function NutritionSummary({ targetMacros, weeklySummary }) {
  const [expandedRow, setExpandedRow] = useState(null);

  if (!weeklySummary || !targetMacros) {
    return null;
  }

  const getVarianceColor = (variance) => {
    if (Math.abs(variance) <= 5) return '#85cc17'; // Green - within 5%
    if (Math.abs(variance) <= 15) return '#fbbf24'; // Yellow - within 15%
    return '#f87171'; // Red - beyond 15%
  };

  const VarianceCell = ({ value, label }) => {
    const color = getVarianceColor(value);
    const isNegative = value < 0;

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        <span
          style={{
            color: color,
            fontWeight: '600',
            fontSize: '0.95rem'
          }}
        >
          {isNegative ? '▼' : '▲'} {Math.abs(value).toFixed(1)}%
        </span>
        <span
          style={{
            color: 'rgba(255, 255, 255, 0.4)',
            fontSize: '0.7rem'
          }}
        >
          {label}
        </span>
      </div>
    );
  };

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '25px',
        marginTop: '30px'
      }}
    >
      <h2
        style={{
          color: '#fff',
          fontSize: '1.3rem',
          margin: '0 0 25px 0',
          fontWeight: '600'
        }}
      >
        📊 Weekly Summary
      </h2>

      {/* Status Badges */}
      <div
        style={{
          display: 'flex',
          gap: '15px',
          marginBottom: '25px',
          flexWrap: 'wrap'
        }}
      >
        <div
          style={{
            background:
              weeklySummary.overall_valid === true
                ? 'rgba(133, 204, 23, 0.15)'
                : 'rgba(239, 68, 68, 0.15)',
            border:
              weeklySummary.overall_valid === true
                ? '1px solid #85cc17'
                : '1px solid #f87171',
            borderRadius: '8px',
            padding: '10px 15px',
            fontSize: '0.9rem',
            color:
              weeklySummary.overall_valid === true ? '#85cc17' : '#fca5a5'
          }}
        >
          {weeklySummary.overall_valid === true ? '✓' : '✕'} Overall Plan{' '}
          {weeklySummary.overall_valid === true ? 'Valid' : 'Needs Review'}
        </div>

        <div
          style={{
            background: 'rgba(133, 204, 23, 0.15)',
            border: '1px solid #85cc17',
            borderRadius: '8px',
            padding: '10px 15px',
            fontSize: '0.9rem',
            color: '#85cc17'
          }}
        >
          ✓ {weeklySummary.days_valid} of 7 Days Valid
        </div>

        {weeklySummary.days_invalid > 0 && (
          <div
            style={{
              background: 'rgba(251, 191, 36, 0.15)',
              border: '1px solid #fbbf24',
              borderRadius: '8px',
              padding: '10px 15px',
              fontSize: '0.9rem',
              color: '#fcd34d'
            }}
          >
            ⚠️ {weeklySummary.days_invalid} Days Need Review
          </div>
        )}

        {weeklySummary.total_warnings > 0 && (
          <div
            style={{
              background: 'rgba(251, 191, 36, 0.15)',
              border: '1px solid #fbbf24',
              borderRadius: '8px',
              padding: '10px 15px',
              fontSize: '0.9rem',
              color: '#fcd34d'
            }}
          >
            ⚠️ {weeklySummary.total_warnings} Warnings
          </div>
        )}
      </div>

      {/* Main Comparison Table */}
      <div
        style={{
          overflowX: 'auto',
          marginBottom: '25px'
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.9rem'
          }}
        >
          <thead>
            <tr style={{ borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>
              <th
                style={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  textAlign: 'left',
                  padding: '12px 0',
                  fontWeight: '600',
                  fontSize: '0.8rem'
                }}
              >
                METRIC
              </th>
              <th
                style={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  textAlign: 'center',
                  padding: '12px',
                  fontWeight: '600',
                  fontSize: '0.8rem'
                }}
              >
                TARGET
              </th>
              <th
                style={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  textAlign: 'center',
                  padding: '12px',
                  fontWeight: '600',
                  fontSize: '0.8rem'
                }}
              >
                WEEKLY TOTAL
              </th>
              <th
                style={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  textAlign: 'center',
                  padding: '12px',
                  fontWeight: '600',
                  fontSize: '0.8rem'
                }}
              >
                DAILY AVG
              </th>
              <th
                style={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  textAlign: 'center',
                  padding: '12px',
                  fontWeight: '600',
                  fontSize: '0.8rem'
                }}
              >
                VARIANCE
              </th>
            </tr>
          </thead>

          <tbody>
            {/* Calories */}
            <tr
              style={{
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                cursor: 'pointer',
                background:
                  expandedRow === 'calories'
                    ? 'rgba(255, 255, 255, 0.03)'
                    : 'transparent',
                transition: 'background 0.2s ease'
              }}
              onClick={() =>
                setExpandedRow(
                  expandedRow === 'calories' ? null : 'calories'
                )
              }
            >
              <td
                style={{
                  color: '#85cc17',
                  padding: '12px 0',
                  fontWeight: '600'
                }}
              >
                🔥 Calories
              </td>
              <td style={{ textAlign: 'center', padding: '12px' }}>
                <span style={{ color: '#fff' }}>
                  {(targetMacros.calorie_target * 7).toLocaleString()}
                </span>
                <span
                  style={{
                    display: 'block',
                    color: 'rgba(255, 255, 255, 0.4)',
                    fontSize: '0.75rem'
                  }}
                >
                  ({targetMacros.calorie_target}/day)
                </span>
              </td>
              <td style={{ textAlign: 'center', padding: '12px', color: '#fff' }}>
                {Math.round(weeklySummary.weekly_totals.calories).toLocaleString()}
              </td>
              <td style={{ textAlign: 'center', padding: '12px', color: '#85cc17' }}>
                {Math.round(weeklySummary.weekly_averages.calories)}
              </td>
              <td style={{ textAlign: 'center', padding: '12px' }}>
                <VarianceCell
                  value={
                    ((weeklySummary.weekly_totals.calories -
                      targetMacros.calorie_target * 7) /
                      (targetMacros.calorie_target * 7)) *
                    100
                  }
                  label="Variance"
                />
              </td>
            </tr>

            {/* Protein */}
            <tr
              style={{
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                cursor: 'pointer',
                background:
                  expandedRow === 'protein'
                    ? 'rgba(255, 255, 255, 0.03)'
                    : 'transparent',
                transition: 'background 0.2s ease'
              }}
              onClick={() =>
                setExpandedRow(expandedRow === 'protein' ? null : 'protein')
              }
            >
              <td
                style={{
                  color: '#fff',
                  padding: '12px 0',
                  fontWeight: '600'
                }}
              >
                💪 Protein
              </td>
              <td style={{ textAlign: 'center', padding: '12px' }}>
                <span style={{ color: '#fff' }}>
                  {(targetMacros.protein * 7).toFixed(0)}g
                </span>
                <span
                  style={{
                    display: 'block',
                    color: 'rgba(255, 255, 255, 0.4)',
                    fontSize: '0.75rem'
                  }}
                >
                  ({targetMacros.protein.toFixed(0)}/day)
                </span>
              </td>
              <td style={{ textAlign: 'center', padding: '12px', color: '#fff' }}>
                {weeklySummary.weekly_totals.protein.toFixed(1)}g
              </td>
              <td style={{ textAlign: 'center', padding: '12px', color: '#fff' }}>
                {weeklySummary.weekly_averages.protein.toFixed(1)}g
              </td>
              <td style={{ textAlign: 'center', padding: '12px' }}>
                <VarianceCell
                  value={
                    ((weeklySummary.weekly_totals.protein -
                      targetMacros.protein * 7) /
                      (targetMacros.protein * 7)) *
                    100
                  }
                  label="Variance"
                />
              </td>
            </tr>

            {/* Carbs */}
            <tr
              style={{
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                cursor: 'pointer',
                background:
                  expandedRow === 'carbs'
                    ? 'rgba(255, 255, 255, 0.03)'
                    : 'transparent',
                transition: 'background 0.2s ease'
              }}
              onClick={() => setExpandedRow(expandedRow === 'carbs' ? null : 'carbs')}
            >
              <td
                style={{
                  color: '#fff',
                  padding: '12px 0',
                  fontWeight: '600'
                }}
              >
                🍞 Carbs
              </td>
              <td style={{ textAlign: 'center', padding: '12px' }}>
                <span style={{ color: '#fff' }}>
                  {(targetMacros.carbs * 7).toFixed(0)}g
                </span>
                <span
                  style={{
                    display: 'block',
                    color: 'rgba(255, 255, 255, 0.4)',
                    fontSize: '0.75rem'
                  }}
                >
                  ({targetMacros.carbs.toFixed(0)}/day)
                </span>
              </td>
              <td style={{ textAlign: 'center', padding: '12px', color: '#fff' }}>
                {weeklySummary.weekly_totals.carbs.toFixed(1)}g
              </td>
              <td style={{ textAlign: 'center', padding: '12px', color: '#fff' }}>
                {weeklySummary.weekly_averages.carbs.toFixed(1)}g
              </td>
              <td style={{ textAlign: 'center', padding: '12px' }}>
                <VarianceCell
                  value={
                    ((weeklySummary.weekly_totals.carbs -
                      targetMacros.carbs * 7) /
                      (targetMacros.carbs * 7)) *
                    100
                  }
                  label="Variance"
                />
              </td>
            </tr>

            {/* Fat */}
            <tr
              style={{
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                cursor: 'pointer',
                background:
                  expandedRow === 'fat'
                    ? 'rgba(255, 255, 255, 0.03)'
                    : 'transparent',
                transition: 'background 0.2s ease'
              }}
              onClick={() => setExpandedRow(expandedRow === 'fat' ? null : 'fat')}
            >
              <td
                style={{
                  color: '#fff',
                  padding: '12px 0',
                  fontWeight: '600'
                }}
              >
                🥑 Fat
              </td>
              <td style={{ textAlign: 'center', padding: '12px' }}>
                <span style={{ color: '#fff' }}>
                  {(targetMacros.fat * 7).toFixed(0)}g
                </span>
                <span
                  style={{
                    display: 'block',
                    color: 'rgba(255, 255, 255, 0.4)',
                    fontSize: '0.75rem'
                  }}
                >
                  ({targetMacros.fat.toFixed(0)}/day)
                </span>
              </td>
              <td style={{ textAlign: 'center', padding: '12px', color: '#fff' }}>
                {weeklySummary.weekly_totals.fat.toFixed(1)}g
              </td>
              <td style={{ textAlign: 'center', padding: '12px', color: '#fff' }}>
                {weeklySummary.weekly_averages.fat.toFixed(1)}g
              </td>
              <td style={{ textAlign: 'center', padding: '12px' }}>
                <VarianceCell
                  value={
                    ((weeklySummary.weekly_totals.fat -
                      targetMacros.fat * 7) /
                      (targetMacros.fat * 7)) *
                    100
                  }
                  label="Variance"
                />
              </td>
            </tr>

            {/* Fiber */}
            <tr
              style={{
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
              }}
            >
              <td
                style={{
                  color: '#fff',
                  padding: '12px 0',
                  fontWeight: '600'
                }}
              >
                🌾 Fiber
              </td>
              <td style={{ textAlign: 'center', padding: '12px' }}>
                <span style={{ color: '#fff' }}>
                  ≥ {(targetMacros.fiber_min * 7).toFixed(0)}g
                </span>
                <span
                  style={{
                    display: 'block',
                    color: 'rgba(255, 255, 255, 0.4)',
                    fontSize: '0.75rem'
                  }}
                >
                  (min)
                </span>
              </td>
              <td style={{ textAlign: 'center', padding: '12px', color: '#fff' }}>
                {weeklySummary.weekly_totals.fiber.toFixed(1)}g
              </td>
              <td style={{ textAlign: 'center', padding: '12px', color: '#85cc17' }}>
                {weeklySummary.weekly_averages.fiber.toFixed(1)}g
              </td>
              <td style={{ textAlign: 'center', padding: '12px', color: '#85cc17' }}>
                ✓
              </td>
            </tr>

            {/* Sugar */}
            <tr>
              <td
                style={{
                  color: '#fff',
                  padding: '12px 0',
                  fontWeight: '600'
                }}
              >
                🍬 Sugar
              </td>
              <td style={{ textAlign: 'center', padding: '12px' }}>
                <span style={{ color: '#fff' }}>
                  ≤ {(targetMacros.sugar_max * 7).toFixed(0)}g
                </span>
                <span
                  style={{
                    display: 'block',
                    color: 'rgba(255, 255, 255, 0.4)',
                    fontSize: '0.75rem'
                  }}
                >
                  (max)
                </span>
              </td>
              <td style={{ textAlign: 'center', padding: '12px', color: '#fff' }}>
                {weeklySummary.weekly_totals.sugar.toFixed(1)}g
              </td>
              <td style={{ textAlign: 'center', padding: '12px', color: '#fff' }}>
                {weeklySummary.weekly_averages.sugar.toFixed(1)}g
              </td>
              <td style={{ textAlign: 'center', padding: '12px', color: '#85cc17' }}>
                ✓
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '8px',
          padding: '12px',
          fontSize: '0.8rem',
          color: 'rgba(255, 255, 255, 0.6)'
        }}
      >
        <strong>Variance Color Guide:</strong> 🟢 ±0-5% (Excellent) | 🟡 ±5-15%
        (Good) | 🔴 ±15%+ (Review Needed)
      </div>
    </div>
  );
}

export default NutritionSummary;