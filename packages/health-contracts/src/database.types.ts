export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      activities: {
        Row: {
          active_energy_kcal: number | null;
          activity_type: string;
          average_heart_rate: number | null;
          average_speed: number | null;
          created_at: string;
          device_id: string | null;
          distance_meters: number | null;
          duration_seconds: number;
          elevation_gain_meters: number | null;
          end_at: string;
          fit_file_id: string | null;
          id: string;
          maximum_heart_rate: number | null;
          maximum_speed: number | null;
          metadata: Json;
          moving_seconds: number | null;
          resting_energy_kcal: number | null;
          source_activity_id: string | null;
          source_hash: string;
          source_type: string;
          start_at: string;
          timezone: string;
          training_load: number | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          active_energy_kcal?: number | null;
          activity_type: string;
          average_heart_rate?: number | null;
          average_speed?: number | null;
          created_at?: string;
          device_id?: string | null;
          distance_meters?: number | null;
          duration_seconds: number;
          elevation_gain_meters?: number | null;
          end_at: string;
          fit_file_id?: string | null;
          id?: string;
          maximum_heart_rate?: number | null;
          maximum_speed?: number | null;
          metadata?: Json;
          moving_seconds?: number | null;
          resting_energy_kcal?: number | null;
          source_activity_id?: string | null;
          source_hash: string;
          source_type: string;
          start_at: string;
          timezone: string;
          training_load?: number | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          active_energy_kcal?: number | null;
          activity_type?: string;
          average_heart_rate?: number | null;
          average_speed?: number | null;
          created_at?: string;
          device_id?: string | null;
          distance_meters?: number | null;
          duration_seconds?: number;
          elevation_gain_meters?: number | null;
          end_at?: string;
          fit_file_id?: string | null;
          id?: string;
          maximum_heart_rate?: number | null;
          maximum_speed?: number | null;
          metadata?: Json;
          moving_seconds?: number | null;
          resting_energy_kcal?: number | null;
          source_activity_id?: string | null;
          source_hash?: string;
          source_type?: string;
          start_at?: string;
          timezone?: string;
          training_load?: number | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "activities_device_id_fkey";
            columns: ["device_id"];
            isOneToOne: false;
            referencedRelation: "devices";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "activities_fit_file_id_fkey";
            columns: ["fit_file_id"];
            isOneToOne: false;
            referencedRelation: "fit_files";
            referencedColumns: ["id"];
          },
        ];
      };
      activity_laps: {
        Row: {
          activity_id: string;
          average_heart_rate: number | null;
          distance_meters: number | null;
          duration_seconds: number;
          end_at: string;
          id: string;
          lap_index: number;
          maximum_heart_rate: number | null;
          metadata: Json;
          start_at: string;
          user_id: string;
        };
        Insert: {
          activity_id: string;
          average_heart_rate?: number | null;
          distance_meters?: number | null;
          duration_seconds: number;
          end_at: string;
          id?: string;
          lap_index: number;
          maximum_heart_rate?: number | null;
          metadata?: Json;
          start_at: string;
          user_id: string;
        };
        Update: {
          activity_id?: string;
          average_heart_rate?: number | null;
          distance_meters?: number | null;
          duration_seconds?: number;
          end_at?: string;
          id?: string;
          lap_index?: number;
          maximum_heart_rate?: number | null;
          metadata?: Json;
          start_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "activity_laps_activity_id_fkey";
            columns: ["activity_id"];
            isOneToOne: false;
            referencedRelation: "activities";
            referencedColumns: ["id"];
          },
        ];
      };
      activity_records: {
        Row: {
          activity_id: string;
          altitude_meters: number | null;
          cadence: number | null;
          distance_meters: number | null;
          heart_rate: number | null;
          id: number;
          latitude: number | null;
          longitude: number | null;
          metadata: Json;
          power: number | null;
          recorded_at: string;
          speed: number | null;
          temperature: number | null;
          user_id: string;
        };
        Insert: {
          activity_id: string;
          altitude_meters?: number | null;
          cadence?: number | null;
          distance_meters?: number | null;
          heart_rate?: number | null;
          id?: never;
          latitude?: number | null;
          longitude?: number | null;
          metadata?: Json;
          power?: number | null;
          recorded_at: string;
          speed?: number | null;
          temperature?: number | null;
          user_id: string;
        };
        Update: {
          activity_id?: string;
          altitude_meters?: number | null;
          cadence?: number | null;
          distance_meters?: number | null;
          heart_rate?: number | null;
          id?: never;
          latitude?: number | null;
          longitude?: number | null;
          metadata?: Json;
          power?: number | null;
          recorded_at?: string;
          speed?: number | null;
          temperature?: number | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "activity_records_activity_id_fkey";
            columns: ["activity_id"];
            isOneToOne: false;
            referencedRelation: "activities";
            referencedColumns: ["id"];
          },
        ];
      };
      audit_events: {
        Row: {
          actor_id: string | null;
          actor_type: string;
          created_at: string;
          event_type: string;
          id: number;
          request_id: string;
          resource_id: string | null;
          resource_type: string | null;
          safe_metadata: Json;
          user_id: string | null;
        };
        Insert: {
          actor_id?: string | null;
          actor_type: string;
          created_at?: string;
          event_type: string;
          id?: never;
          request_id: string;
          resource_id?: string | null;
          resource_type?: string | null;
          safe_metadata?: Json;
          user_id?: string | null;
        };
        Update: {
          actor_id?: string | null;
          actor_type?: string;
          created_at?: string;
          event_type?: string;
          id?: never;
          request_id?: string;
          resource_id?: string | null;
          resource_type?: string | null;
          safe_metadata?: Json;
          user_id?: string | null;
        };
        Relationships: [];
      };
      baseline_snapshots: {
        Row: {
          as_of_date: string;
          calculation_version: string;
          created_at: string;
          data_completeness: number;
          id: string;
          mad_value: number | null;
          maturity_status: string;
          mean_value: number | null;
          median_value: number | null;
          metric_type: string;
          p10: number | null;
          p25: number | null;
          p75: number | null;
          p90: number | null;
          trend_slope: number | null;
          user_id: string;
          valid_day_count: number;
          window_days: number;
        };
        Insert: {
          as_of_date: string;
          calculation_version: string;
          created_at?: string;
          data_completeness: number;
          id?: string;
          mad_value?: number | null;
          maturity_status: string;
          mean_value?: number | null;
          median_value?: number | null;
          metric_type: string;
          p10?: number | null;
          p25?: number | null;
          p75?: number | null;
          p90?: number | null;
          trend_slope?: number | null;
          user_id: string;
          valid_day_count: number;
          window_days: number;
        };
        Update: {
          as_of_date?: string;
          calculation_version?: string;
          created_at?: string;
          data_completeness?: number;
          id?: string;
          mad_value?: number | null;
          maturity_status?: string;
          mean_value?: number | null;
          median_value?: number | null;
          metric_type?: string;
          p10?: number | null;
          p25?: number | null;
          p75?: number | null;
          p90?: number | null;
          trend_slope?: number | null;
          user_id?: string;
          valid_day_count?: number;
          window_days?: number;
        };
        Relationships: [];
      };
      coach_reports: {
        Row: {
          data_completeness: number;
          deterministic_findings: Json;
          generated_at: string;
          generation_mode: string;
          id: string;
          model_name: string | null;
          model_provider: string | null;
          narrative_text: string;
          period_end: string;
          period_start: string;
          prompt_version: string | null;
          report_type: string;
          safety_flags: Json;
          user_id: string;
        };
        Insert: {
          data_completeness: number;
          deterministic_findings: Json;
          generated_at?: string;
          generation_mode: string;
          id?: string;
          model_name?: string | null;
          model_provider?: string | null;
          narrative_text: string;
          period_end: string;
          period_start: string;
          prompt_version?: string | null;
          report_type: string;
          safety_flags?: Json;
          user_id: string;
        };
        Update: {
          data_completeness?: number;
          deterministic_findings?: Json;
          generated_at?: string;
          generation_mode?: string;
          id?: string;
          model_name?: string | null;
          model_provider?: string | null;
          narrative_text?: string;
          period_end?: string;
          period_start?: string;
          prompt_version?: string | null;
          report_type?: string;
          safety_flags?: Json;
          user_id?: string;
        };
        Relationships: [];
      };
      daily_checkins: {
        Row: {
          anxiety_rating: number | null;
          caffeine_unit: string | null;
          caffeine_value: number | null;
          created_at: string;
          energy_rating: number | null;
          focus_rating: number | null;
          illness_flag: boolean | null;
          local_date: string;
          mood_rating: number | null;
          notes: string | null;
          notes_ai_access_enabled: boolean;
          perceived_sleep_quality: number | null;
          soreness_rating: number | null;
          stress_rating: number | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          anxiety_rating?: number | null;
          caffeine_unit?: string | null;
          caffeine_value?: number | null;
          created_at?: string;
          energy_rating?: number | null;
          focus_rating?: number | null;
          illness_flag?: boolean | null;
          local_date: string;
          mood_rating?: number | null;
          notes?: string | null;
          notes_ai_access_enabled?: boolean;
          perceived_sleep_quality?: number | null;
          soreness_rating?: number | null;
          stress_rating?: number | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          anxiety_rating?: number | null;
          caffeine_unit?: string | null;
          caffeine_value?: number | null;
          created_at?: string;
          energy_rating?: number | null;
          focus_rating?: number | null;
          illness_flag?: boolean | null;
          local_date?: string;
          mood_rating?: number | null;
          notes?: string | null;
          notes_ai_access_enabled?: boolean;
          perceived_sleep_quality?: number | null;
          soreness_rating?: number | null;
          stress_rating?: number | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      daily_metrics: {
        Row: {
          active_energy_kcal: number | null;
          average_heart_rate: number | null;
          awake_minutes: number | null;
          bedtime_local: string | null;
          body_mass_kg: number | null;
          calculated_at: string;
          core_sleep_minutes: number | null;
          data_completeness_percent: number;
          day_completion_status: string;
          deep_sleep_minutes: number | null;
          hrv_sdnn_ms: number | null;
          in_bed_minutes: number | null;
          local_date: string;
          maximum_heart_rate: number | null;
          minimum_heart_rate: number | null;
          nap_minutes: number | null;
          quality_flags: Json;
          rem_sleep_minutes: number | null;
          resting_energy_kcal: number | null;
          resting_heart_rate: number | null;
          sleep_midpoint_local: string | null;
          sleep_minutes: number | null;
          sleeping_heart_rate: number | null;
          source_coverage: Json;
          steps: number | null;
          timezone: string;
          updated_at: string;
          user_id: string;
          wake_time_local: string | null;
          walking_running_distance_km: number | null;
          water_ml: number | null;
          workout_count: number | null;
          workout_minutes: number | null;
        };
        Insert: {
          active_energy_kcal?: number | null;
          average_heart_rate?: number | null;
          awake_minutes?: number | null;
          bedtime_local?: string | null;
          body_mass_kg?: number | null;
          calculated_at?: string;
          core_sleep_minutes?: number | null;
          data_completeness_percent?: number;
          day_completion_status?: string;
          deep_sleep_minutes?: number | null;
          hrv_sdnn_ms?: number | null;
          in_bed_minutes?: number | null;
          local_date: string;
          maximum_heart_rate?: number | null;
          minimum_heart_rate?: number | null;
          nap_minutes?: number | null;
          quality_flags?: Json;
          rem_sleep_minutes?: number | null;
          resting_energy_kcal?: number | null;
          resting_heart_rate?: number | null;
          sleep_midpoint_local?: string | null;
          sleep_minutes?: number | null;
          sleeping_heart_rate?: number | null;
          source_coverage?: Json;
          steps?: number | null;
          timezone: string;
          updated_at?: string;
          user_id: string;
          wake_time_local?: string | null;
          walking_running_distance_km?: number | null;
          water_ml?: number | null;
          workout_count?: number | null;
          workout_minutes?: number | null;
        };
        Update: {
          active_energy_kcal?: number | null;
          average_heart_rate?: number | null;
          awake_minutes?: number | null;
          bedtime_local?: string | null;
          body_mass_kg?: number | null;
          calculated_at?: string;
          core_sleep_minutes?: number | null;
          data_completeness_percent?: number;
          day_completion_status?: string;
          deep_sleep_minutes?: number | null;
          hrv_sdnn_ms?: number | null;
          in_bed_minutes?: number | null;
          local_date?: string;
          maximum_heart_rate?: number | null;
          minimum_heart_rate?: number | null;
          nap_minutes?: number | null;
          quality_flags?: Json;
          rem_sleep_minutes?: number | null;
          resting_energy_kcal?: number | null;
          resting_heart_rate?: number | null;
          sleep_midpoint_local?: string | null;
          sleep_minutes?: number | null;
          sleeping_heart_rate?: number | null;
          source_coverage?: Json;
          steps?: number | null;
          timezone?: string;
          updated_at?: string;
          user_id?: string;
          wake_time_local?: string | null;
          walking_running_distance_km?: number | null;
          water_ml?: number | null;
          workout_count?: number | null;
          workout_minutes?: number | null;
        };
        Relationships: [];
      };
      deletion_jobs: {
        Row: {
          completed_at: string | null;
          id: string;
          requested_at: string;
          safe_error: string | null;
          scope: string;
          status: string;
          user_id: string;
        };
        Insert: {
          completed_at?: string | null;
          id?: string;
          requested_at?: string;
          safe_error?: string | null;
          scope: string;
          status: string;
          user_id: string;
        };
        Update: {
          completed_at?: string | null;
          id?: string;
          requested_at?: string;
          safe_error?: string | null;
          scope?: string;
          status?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      devices: {
        Row: {
          created_at: string;
          device_name: string;
          device_type: string;
          external_device_id: string | null;
          id: string;
          last_seen_at: string | null;
          last_successful_sync_at: string | null;
          manufacturer: string;
          model: string;
          provider_connection_id: string | null;
          revoked_at: string | null;
          source_system: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          device_name: string;
          device_type: string;
          external_device_id?: string | null;
          id?: string;
          last_seen_at?: string | null;
          last_successful_sync_at?: string | null;
          manufacturer: string;
          model: string;
          provider_connection_id?: string | null;
          revoked_at?: string | null;
          source_system: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          device_name?: string;
          device_type?: string;
          external_device_id?: string | null;
          id?: string;
          last_seen_at?: string | null;
          last_successful_sync_at?: string | null;
          manufacturer?: string;
          model?: string;
          provider_connection_id?: string | null;
          revoked_at?: string | null;
          source_system?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "devices_provider_connection_id_fkey";
            columns: ["provider_connection_id"];
            isOneToOne: false;
            referencedRelation: "provider_connections";
            referencedColumns: ["id"];
          },
        ];
      };
      experiments: {
        Row: {
          baseline_end: string;
          baseline_start: string;
          confounders_notes: string | null;
          created_at: string;
          experiment_end: string;
          experiment_start: string;
          hypothesis: string;
          id: string;
          intervention: string;
          primary_metric: string;
          status: string;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          baseline_end: string;
          baseline_start: string;
          confounders_notes?: string | null;
          created_at?: string;
          experiment_end: string;
          experiment_start: string;
          hypothesis: string;
          id?: string;
          intervention: string;
          primary_metric: string;
          status?: string;
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          baseline_end?: string;
          baseline_start?: string;
          confounders_notes?: string | null;
          created_at?: string;
          experiment_end?: string;
          experiment_start?: string;
          hypothesis?: string;
          id?: string;
          intervention?: string;
          primary_metric?: string;
          status?: string;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      export_jobs: {
        Row: {
          completed_at: string | null;
          created_at: string;
          date_range: unknown;
          expires_at: string | null;
          format: string;
          id: string;
          private_storage_path: string | null;
          status: string;
          user_id: string;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string;
          date_range: unknown;
          expires_at?: string | null;
          format: string;
          id?: string;
          private_storage_path?: string | null;
          status: string;
          user_id: string;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string;
          date_range?: unknown;
          expires_at?: string | null;
          format?: string;
          id?: string;
          private_storage_path?: string | null;
          status?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      fit_files: {
        Row: {
          byte_size: number;
          crc_valid: boolean | null;
          created_at: string;
          deleted_at: string | null;
          detected_file_type: string;
          device_id: string | null;
          fit_profile_version: string | null;
          id: string;
          original_filename: string;
          parse_error_code: string | null;
          parse_status: string;
          parsed_at: string | null;
          retention_mode: string;
          safe_filename: string;
          sha256: string;
          storage_object_path: string;
          user_id: string;
        };
        Insert: {
          byte_size: number;
          crc_valid?: boolean | null;
          created_at?: string;
          deleted_at?: string | null;
          detected_file_type: string;
          device_id?: string | null;
          fit_profile_version?: string | null;
          id?: string;
          original_filename: string;
          parse_error_code?: string | null;
          parse_status?: string;
          parsed_at?: string | null;
          retention_mode?: string;
          safe_filename: string;
          sha256: string;
          storage_object_path: string;
          user_id: string;
        };
        Update: {
          byte_size?: number;
          crc_valid?: boolean | null;
          created_at?: string;
          deleted_at?: string | null;
          detected_file_type?: string;
          device_id?: string | null;
          fit_profile_version?: string | null;
          id?: string;
          original_filename?: string;
          parse_error_code?: string | null;
          parse_status?: string;
          parsed_at?: string | null;
          retention_mode?: string;
          safe_filename?: string;
          sha256?: string;
          storage_object_path?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fit_files_device_id_fkey";
            columns: ["device_id"];
            isOneToOne: false;
            referencedRelation: "devices";
            referencedColumns: ["id"];
          },
        ];
      };
      fit_ingestion_jobs: {
        Row: {
          attempt_count: number;
          claimed_at: string | null;
          completed_at: string | null;
          created_at: string;
          fit_file_id: string;
          id: string;
          safe_error_code: string | null;
          safe_error_summary: string | null;
          started_at: string | null;
          status: string;
          updated_at: string;
          user_id: string;
          worker_id: string | null;
        };
        Insert: {
          attempt_count?: number;
          claimed_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          fit_file_id: string;
          id?: string;
          safe_error_code?: string | null;
          safe_error_summary?: string | null;
          started_at?: string | null;
          status?: string;
          updated_at?: string;
          user_id: string;
          worker_id?: string | null;
        };
        Update: {
          attempt_count?: number;
          claimed_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          fit_file_id?: string;
          id?: string;
          safe_error_code?: string | null;
          safe_error_summary?: string | null;
          started_at?: string | null;
          status?: string;
          updated_at?: string;
          user_id?: string;
          worker_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "fit_ingestion_jobs_fit_file_id_fkey";
            columns: ["fit_file_id"];
            isOneToOne: false;
            referencedRelation: "fit_files";
            referencedColumns: ["id"];
          },
        ];
      };
      goals: {
        Row: {
          active: boolean;
          created_at: string;
          end_date: string | null;
          goal_type: string;
          id: string;
          start_date: string;
          target_value: number;
          unit: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          active?: boolean;
          created_at?: string;
          end_date?: string | null;
          goal_type: string;
          id?: string;
          start_date: string;
          target_value: number;
          unit: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          active?: boolean;
          created_at?: string;
          end_date?: string | null;
          goal_type?: string;
          id?: string;
          start_date?: string;
          target_value?: number;
          unit?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      ingestion_events: {
        Row: {
          conflict_count: number;
          created_at: string;
          device_id: string | null;
          duplicate_count: number;
          error_code: string | null;
          exported_at: string;
          id: string;
          idempotency_key: string;
          inserted_count: number;
          processing_duration_ms: number | null;
          provider_type: string;
          received_at: string;
          rejected_count: number;
          request_id: string;
          safe_error_summary: string | null;
          sample_count: number;
          schema_version: string;
          status: string;
          user_id: string;
          window_end: string;
          window_start: string;
        };
        Insert: {
          conflict_count?: number;
          created_at?: string;
          device_id?: string | null;
          duplicate_count?: number;
          error_code?: string | null;
          exported_at: string;
          id?: string;
          idempotency_key: string;
          inserted_count?: number;
          processing_duration_ms?: number | null;
          provider_type: string;
          received_at: string;
          rejected_count?: number;
          request_id: string;
          safe_error_summary?: string | null;
          sample_count: number;
          schema_version: string;
          status: string;
          user_id: string;
          window_end: string;
          window_start: string;
        };
        Update: {
          conflict_count?: number;
          created_at?: string;
          device_id?: string | null;
          duplicate_count?: number;
          error_code?: string | null;
          exported_at?: string;
          id?: string;
          idempotency_key?: string;
          inserted_count?: number;
          processing_duration_ms?: number | null;
          provider_type?: string;
          received_at?: string;
          rejected_count?: number;
          request_id?: string;
          safe_error_summary?: string | null;
          sample_count?: number;
          schema_version?: string;
          status?: string;
          user_id?: string;
          window_end?: string;
          window_start?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ingestion_events_device_id_fkey";
            columns: ["device_id"];
            isOneToOne: false;
            referencedRelation: "devices";
            referencedColumns: ["id"];
          },
        ];
      };
      insights: {
        Row: {
          calculation_version: string;
          comparison: string;
          confidence: number;
          created_at: string;
          data_completeness: number;
          dismissed_at: string | null;
          evidence: Json;
          headline: string;
          id: string;
          insight_type: string;
          interpretation: string;
          local_date: string;
          observation: string;
          recommended_action: string | null;
          severity: string;
          user_id: string;
        };
        Insert: {
          calculation_version: string;
          comparison: string;
          confidence: number;
          created_at?: string;
          data_completeness: number;
          dismissed_at?: string | null;
          evidence?: Json;
          headline: string;
          id?: string;
          insight_type: string;
          interpretation: string;
          local_date: string;
          observation: string;
          recommended_action?: string | null;
          severity: string;
          user_id: string;
        };
        Update: {
          calculation_version?: string;
          comparison?: string;
          confidence?: number;
          created_at?: string;
          data_completeness?: number;
          dismissed_at?: string | null;
          evidence?: Json;
          headline?: string;
          id?: string;
          insight_type?: string;
          interpretation?: string;
          local_date?: string;
          observation?: string;
          recommended_action?: string | null;
          severity?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      knowledge_sources: {
        Row: {
          active: boolean;
          id: string;
          official_url: string;
          organization: string;
          reviewed_at: string;
          summary: string;
          title: string;
          topic: string;
          valid_from: string | null;
          valid_until: string | null;
        };
        Insert: {
          active?: boolean;
          id?: string;
          official_url: string;
          organization: string;
          reviewed_at: string;
          summary: string;
          title: string;
          topic: string;
          valid_from?: string | null;
          valid_until?: string | null;
        };
        Update: {
          active?: boolean;
          id?: string;
          official_url?: string;
          organization?: string;
          reviewed_at?: string;
          summary?: string;
          title?: string;
          topic?: string;
          valid_from?: string | null;
          valid_until?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          date_format: string;
          display_name: string;
          locale: string;
          onboarding_completed_at: string | null;
          time_format: string;
          timezone: string;
          unit_system: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          date_format?: string;
          display_name: string;
          locale?: string;
          onboarding_completed_at?: string | null;
          time_format?: string;
          timezone?: string;
          unit_system?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          date_format?: string;
          display_name?: string;
          locale?: string;
          onboarding_completed_at?: string | null;
          time_format?: string;
          timezone?: string;
          unit_system?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      provider_connections: {
        Row: {
          capabilities: Json;
          created_at: string;
          display_name: string;
          id: string;
          last_attempted_sync_at: string | null;
          last_error_code: string | null;
          last_successful_sync_at: string | null;
          provider_type: string;
          revoked_at: string | null;
          status: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          capabilities?: Json;
          created_at?: string;
          display_name: string;
          id?: string;
          last_attempted_sync_at?: string | null;
          last_error_code?: string | null;
          last_successful_sync_at?: string | null;
          provider_type: string;
          revoked_at?: string | null;
          status?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          capabilities?: Json;
          created_at?: string;
          display_name?: string;
          id?: string;
          last_attempted_sync_at?: string | null;
          last_error_code?: string | null;
          last_successful_sync_at?: string | null;
          provider_type?: string;
          revoked_at?: string | null;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      raw_health_samples: {
        Row: {
          category_value: string | null;
          device_id: string | null;
          end_at: string;
          expires_at: string | null;
          id: string;
          imported_at: string;
          ingestion_event_id: string | null;
          metadata: Json;
          metric_type: string;
          numeric_value: number | null;
          quality_flags: Json;
          source_bundle: string | null;
          source_hash: string;
          source_name: string;
          source_record_id: string | null;
          start_at: string;
          text_value: string | null;
          unit: string | null;
          user_id: string;
        };
        Insert: {
          category_value?: string | null;
          device_id?: string | null;
          end_at: string;
          expires_at?: string | null;
          id?: string;
          imported_at?: string;
          ingestion_event_id?: string | null;
          metadata?: Json;
          metric_type: string;
          numeric_value?: number | null;
          quality_flags?: Json;
          source_bundle?: string | null;
          source_hash: string;
          source_name: string;
          source_record_id?: string | null;
          start_at: string;
          text_value?: string | null;
          unit?: string | null;
          user_id: string;
        };
        Update: {
          category_value?: string | null;
          device_id?: string | null;
          end_at?: string;
          expires_at?: string | null;
          id?: string;
          imported_at?: string;
          ingestion_event_id?: string | null;
          metadata?: Json;
          metric_type?: string;
          numeric_value?: number | null;
          quality_flags?: Json;
          source_bundle?: string | null;
          source_hash?: string;
          source_name?: string;
          source_record_id?: string | null;
          start_at?: string;
          text_value?: string | null;
          unit?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "raw_health_samples_device_id_fkey";
            columns: ["device_id"];
            isOneToOne: false;
            referencedRelation: "devices";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "raw_health_samples_ingestion_event_id_fkey";
            columns: ["ingestion_event_id"];
            isOneToOne: false;
            referencedRelation: "ingestion_events";
            referencedColumns: ["id"];
          },
        ];
      };
      sleep_sessions: {
        Row: {
          asleep_minutes: number | null;
          awake_minutes: number | null;
          confidence: number | null;
          created_at: string;
          end_at: string;
          id: string;
          in_bed_minutes: number | null;
          local_date: string;
          nap: boolean;
          quality_flags: Json;
          source_name: string;
          source_priority: number;
          start_at: string;
          timezone: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          asleep_minutes?: number | null;
          awake_minutes?: number | null;
          confidence?: number | null;
          created_at?: string;
          end_at: string;
          id?: string;
          in_bed_minutes?: number | null;
          local_date: string;
          nap?: boolean;
          quality_flags?: Json;
          source_name: string;
          source_priority?: number;
          start_at: string;
          timezone: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          asleep_minutes?: number | null;
          awake_minutes?: number | null;
          confidence?: number | null;
          created_at?: string;
          end_at?: string;
          id?: string;
          in_bed_minutes?: number | null;
          local_date?: string;
          nap?: boolean;
          quality_flags?: Json;
          source_name?: string;
          source_priority?: number;
          start_at?: string;
          timezone?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      sleep_stages: {
        Row: {
          created_at: string;
          duration_minutes: number;
          end_at: string;
          id: string;
          sleep_session_id: string;
          source_name: string;
          stage_type: string;
          start_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          duration_minutes: number;
          end_at: string;
          id?: string;
          sleep_session_id: string;
          source_name: string;
          stage_type: string;
          start_at: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          duration_minutes?: number;
          end_at?: string;
          id?: string;
          sleep_session_id?: string;
          source_name?: string;
          stage_type?: string;
          start_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sleep_stages_sleep_session_id_fkey";
            columns: ["sleep_session_id"];
            isOneToOne: false;
            referencedRelation: "sleep_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      user_preferences: {
        Row: {
          ai_narrative_enabled: boolean;
          ai_notes_access_enabled: boolean;
          checkins_enabled: boolean;
          coaching_tone: string;
          created_at: string;
          daily_step_target: number | null;
          location_privacy_mode: string;
          maximum_daily_actions: number;
          raw_fit_retention_mode: string;
          raw_sample_retention_days: number;
          reduced_motion_override: boolean | null;
          sleep_target_minutes: number | null;
          theme: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          ai_narrative_enabled?: boolean;
          ai_notes_access_enabled?: boolean;
          checkins_enabled?: boolean;
          coaching_tone?: string;
          created_at?: string;
          daily_step_target?: number | null;
          location_privacy_mode?: string;
          maximum_daily_actions?: number;
          raw_fit_retention_mode?: string;
          raw_sample_retention_days?: number;
          reduced_motion_override?: boolean | null;
          sleep_target_minutes?: number | null;
          theme?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          ai_narrative_enabled?: boolean;
          ai_notes_access_enabled?: boolean;
          checkins_enabled?: boolean;
          coaching_tone?: string;
          created_at?: string;
          daily_step_target?: number | null;
          location_privacy_mode?: string;
          maximum_daily_actions?: number;
          raw_fit_retention_mode?: string;
          raw_sample_retention_days?: number;
          reduced_motion_override?: boolean | null;
          sleep_target_minutes?: number | null;
          theme?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_ingestion_credential: {
        Args: { p_device_name?: string };
        Returns: {
          device_id: string;
          expires_at: string;
          token: string;
          token_hint: string;
        }[];
      };
      claim_fit_job: {
        Args: { p_worker_id: string };
        Returns: {
          attempt_count: number;
          claimed_at: string | null;
          completed_at: string | null;
          created_at: string;
          fit_file_id: string;
          id: string;
          safe_error_code: string | null;
          safe_error_summary: string | null;
          started_at: string | null;
          status: string;
          updated_at: string;
          user_id: string;
          worker_id: string | null;
        };
        SetofOptions: {
          from: "*";
          to: "fit_ingestion_jobs";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      request_account_deletion: { Args: { p_scope?: string }; Returns: string };
      list_ingestion_devices: {
        Args: Record<PropertyKey, never>;
        Returns: {
          credential_created_at: string;
          device_id: string;
          device_name: string;
          expires_at: string;
          last_used_at: string | null;
          revoked_at: string | null;
          token_hint: string;
        }[];
      };
      revoke_ingestion_device: {
        Args: { p_device_id: string };
        Returns: boolean;
      };
      rotate_ingestion_credential: {
        Args: { p_device_id: string };
        Returns: {
          device_id: string;
          expires_at: string;
          token: string;
          token_hint: string;
        }[];
      };
      service_issue_ingestion_credential: {
        Args: {
          p_device_id: string;
          p_expires_at?: string;
          p_rotation_parent_id?: string;
          p_token: string;
          p_token_hint: string;
          p_user_id: string;
        };
        Returns: string;
      };
      service_mark_credential_used: {
        Args: { p_credential_id: string };
        Returns: undefined;
      };
      service_resolve_ingestion_credential: {
        Args: { p_device_id: string; p_token: string };
        Returns: {
          credential_id: string;
          device_id: string;
          user_id: string;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
