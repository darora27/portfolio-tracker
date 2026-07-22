export type Database = {
  public: {
    Tables: {
      trades: {
        Row: {
          id: number;
          date: string;
          ticker: string;
          action: "buy" | "sell";
          shares: number;
          price: number;
          total: number;
          reason: string | null;
          realized_gain: number | null;
        };
        Insert: Omit<Database["public"]["Tables"]["trades"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["trades"]["Insert"]>;
        Relationships: [];
      };
      snapshots: {
        Row: {
          id: number;
          date: string;
          total_cost: number;
          total_value: number;
        };
        Insert: Omit<Database["public"]["Tables"]["snapshots"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["snapshots"]["Insert"]>;
        Relationships: [];
      };
      snapshot_positions: {
        Row: {
          id: number;
          snapshot_id: number;
          ticker: string;
          shares: number;
          close_price: number;
          value: number;
        };
        Insert: Omit<
          Database["public"]["Tables"]["snapshot_positions"]["Row"],
          "id"
        >;
        Update: Partial<
          Database["public"]["Tables"]["snapshot_positions"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "snapshot_positions_snapshot_id_fkey";
            columns: ["snapshot_id"];
            referencedRelation: "snapshots";
            referencedColumns: ["id"];
          },
        ];
      };
      benchmarks: {
        Row: {
          id: number;
          date: string;
          ticker: "VOO" | "VTI" | "XLK";
          close: number;
        };
        Insert: Omit<Database["public"]["Tables"]["benchmarks"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["benchmarks"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
