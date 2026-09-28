import { db, ProgressRecord } from '../config/db.js';

export interface MetricComparison {
  metric: string;
  unit: string;
  current: number | null;
  previous: number | null;
  change: number | null;
  direction: 'improved' | 'declined' | 'stable' | 'neutral';
  formatted: string;
}

export class ProgressService {
  /**
   * Calculates BMI given weight in kg and height in meters or centimeters
   */
  static calculateBMI(weightKg?: number, height?: number): number | undefined {
    if (!weightKg || !height || weightKg <= 0 || height <= 0) return undefined;

    // If height is entered in cm (e.g. 175), convert to meters (1.75)
    const heightInMeters = height > 3 ? height / 100 : height;
    const bmi = weightKg / (heightInMeters * heightInMeters);
    return Math.round(bmi * 10) / 10;
  }

  /**
   * Gets all chronological progress records for a patient (oldest first for charts, newest first for timeline)
   */
  static getPatientProgressRecords(patientId: string): ProgressRecord[] {
    return db.progress_records
      .filter((r) => r.patient_id === patientId)
      .sort((a, b) => new Date(a.review_date).getTime() - new Date(b.review_date).getTime());
  }

  /**
   * Compares the most recent review with the immediately preceding review
   */
  static compareProgress(patientId: string): {
    latestRecord: ProgressRecord | null;
    previousRecord: ProgressRecord | null;
    comparisons: MetricComparison[];
  } {
    const records = this.getPatientProgressRecords(patientId);

    if (records.length === 0) {
      return { latestRecord: null, previousRecord: null, comparisons: [] };
    }

    const latestRecord = records[records.length - 1];
    const previousRecord = records.length > 1 ? records[records.length - 2] : null;

    const comparisons: MetricComparison[] = [];

    // Helper for comparing numeric metrics
    const addComparison = (
      name: string,
      unit: string,
      cur?: number,
      prev?: number,
      lowerIsBetter: boolean = true
    ) => {
      if (cur !== undefined && cur !== null) {
        const change = prev !== undefined && prev !== null ? Math.round((cur - prev) * 10) / 10 : null;
        let direction: 'improved' | 'declined' | 'stable' | 'neutral' = 'neutral';

        if (change !== null) {
          if (change === 0) {
            direction = 'stable';
          } else if (lowerIsBetter ? change < 0 : change > 0) {
            direction = 'improved';
          } else {
            direction = 'declined';
          }
        }

        const formatted =
          prev !== undefined && prev !== null && change !== null
            ? `Previous: ${prev} ${unit} → Current: ${cur} ${unit} (${change > 0 ? '+' : ''}${change} ${unit})`
            : `Current: ${cur} ${unit}`;

        comparisons.push({
          metric: name,
          unit,
          current: cur,
          previous: prev ?? null,
          change,
          direction,
          formatted,
        });
      }
    };

    addComparison('Weight', 'kg', latestRecord.weight, previousRecord?.weight, true);
    addComparison('BMI', 'kg/m²', latestRecord.bmi, previousRecord?.bmi, true);
    addComparison('Systolic BP', 'mmHg', latestRecord.systolic_bp, previousRecord?.systolic_bp, true);
    addComparison('Diastolic BP', 'mmHg', latestRecord.diastolic_bp, previousRecord?.diastolic_bp, true);
    addComparison('Heart Rate', 'bpm', latestRecord.heart_rate, previousRecord?.heart_rate, true);
    addComparison('Blood Sugar', 'mg/dL', latestRecord.blood_sugar, previousRecord?.blood_sugar, true);
    addComparison('Oxygen Saturation', '%', latestRecord.oxygen_saturation, previousRecord?.oxygen_saturation, false);
    addComparison('Body Temperature', '°F', latestRecord.temperature, previousRecord?.temperature, true);

    return {
      latestRecord,
      previousRecord,
      comparisons,
    };
  }

  /**
   * Formats chart data series for Recharts
   */
  static getChartMetrics(patientId: string) {
    const records = this.getPatientProgressRecords(patientId);

    return records.map((r, index) => {
      const reviewDateObj = new Date(r.review_date);
      const dateStr = reviewDateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });

      return {
        id: r.id,
        reviewNumber: `Review ${index + 1}`,
        reviewDate: dateStr,
        fullDate: r.review_date,
        weight: r.weight ?? null,
        bmi: r.bmi ?? null,
        heart_rate: r.heart_rate ?? null,
        systolic_bp: r.systolic_bp ?? null,
        diastolic_bp: r.diastolic_bp ?? null,
        blood_sugar: r.blood_sugar ?? null,
        temperature: r.temperature ?? null,
        oxygen_saturation: r.oxygen_saturation ?? null,
        progress_status: r.progress_status,
      };
    });
  }
}
