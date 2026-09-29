/**
 * Tipos de la base de datos (reflejan supabase/schema.sql).
 * Si prefieres generarlos automáticamente:
 *   npx supabase gen types typescript --project-id <id> > src/types/database.ts
 */

export type NivelDependencia = 'leve' | 'moderada' | 'severa';
export type TipoInventario = 'medicamento' | 'insumo' | 'otro';
export type TipoRegistro =
  | 'medicamento_administrado'
  | 'tarea'
  | 'cambio_inventario'
  | 'nota'
  | 'actividad';
export type CategoriaGasto = 'medicamento' | 'otro';
export type TipoEvento = 'turno_cuidado' | 'dia_libre' | 'actividad_social' | 'autocuidado';

type Timestamps = {
  created_at: string;
  updated_at: string;
};

export type Rutina = {
  hora: string;
  descripcion: string;
};

export type Usuario = Timestamps & {
  id: string;
  auth_user_id: string;
  nombre: string;
  edad: number | null;
  condicion_fisica: string | null;
  perfil_salud: string | null;
  direccion: string | null;
  correo: string | null;
  telefono: string | null;
  recreacion: string | null;
  /** Si tiene fecha, la cuenta está en pausa (sin recordatorios). */
  pausada_en: string | null;
};

export type PersonaCuidada = Timestamps & {
  id: string;
  usuario_id: string;
  cuenta_auth_id: string | null;
  nombre: string;
  edad: number | null;
  direccion: string | null;
  telefono: string | null;
  condicion_enfermedad: string | null;
  nivel_dependencia: NivelDependencia;
  necesidades_fisicas: string | null;
  necesidades_mentales: string | null;
  rutinas: Rutina[];
  comentarios_adicionales: string | null;
};

export type Medicamento = Timestamps & {
  id: string;
  persona_cuidada_id: string;
  nombre: string;
  laboratorio: string | null;
  dosis: string;
  /** Horas en formato "HH:MM:SS" (tipo time de PostgreSQL). */
  horas_toma: string[];
  indicaciones_especiales: string | null;
  /** Ítem del inventario del que se descuenta cada toma (opcional). */
  inventario_id: string | null;
  /** Unidades que se descuentan del inventario en cada toma. */
  unidades_por_toma: number;
};

export type ItemInventario = Timestamps & {
  id: string;
  usuario_id: string;
  persona_cuidada_id: string | null;
  nombre: string;
  tipo: TipoInventario;
  descripcion: string | null;
  cantidad: number;
  umbral_bajo: number;
};

export type Registro = Timestamps & {
  id: string;
  usuario_id: string;
  persona_cuidada_id: string | null;
  tipo: TipoRegistro;
  descripcion: string;
  fecha_hora: string;
  medicamento_id: string | null;
  hora_programada: string | null;
  inventario_id: string | null;
};

export type Informacion = Timestamps & {
  id: string;
  usuario_id: string;
  nombre: string;
  tipo_servicio: string;
  descripcion: string | null;
  direccion: string | null;
  telefono: string | null;
  utilidad: string | null;
};

export type EventoRecreacion = Timestamps & {
  id: string;
  usuario_id: string;
  titulo: string;
  descripcion: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  tipo: TipoEvento;
};

export type Gasto = Timestamps & {
  id: string;
  usuario_id: string;
  persona_cuidada_id: string | null;
  categoria: CategoriaGasto;
  nombre: string;
  /** Total pagado en pesos chilenos. */
  precio: number;
  /** Unidades compradas (para comparar precio por unidad). */
  cantidad: number;
  /** Farmacia o tienda. */
  lugar: string | null;
  /** YYYY-MM-DD */
  fecha: string;
  notas: string | null;
  /** Ítem del inventario al que se sumaron las unidades compradas (opcional). */
  inventario_id: string | null;
};

/** Columnas que la base de datos completa sola (id, fechas y dueño). */
type AutoColumns = 'id' | 'created_at' | 'updated_at' | 'usuario_id' | 'auth_user_id';

type Optionalize<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type InsertOf<T> = Optionalize<T, Extract<keyof T, AutoColumns>>;
export type UpdateOf<T> = Partial<T>;

type Table<T> = {
  Row: T;
  Insert: InsertOf<T>;
  Update: UpdateOf<T>;
  Relationships: [];
};

export type UsuarioInsert = Optionalize<InsertOf<Usuario>, 'pausada_en'>;
export type PersonaCuidadaInsert = Optionalize<
  InsertOf<PersonaCuidada>,
  'cuenta_auth_id' | 'rutinas'
>;
export type MedicamentoInsert = InsertOf<Medicamento>;
export type ItemInventarioInsert = InsertOf<ItemInventario>;
export type RegistroInsert = Optionalize<
  InsertOf<Registro>,
  'fecha_hora' | 'medicamento_id' | 'hora_programada' | 'inventario_id'
>;
export type InformacionInsert = InsertOf<Informacion>;
export type EventoRecreacionInsert = InsertOf<EventoRecreacion>;
export type GastoInsert = InsertOf<Gasto>;

export type Database = {
  public: {
    Tables: {
      usuarios: {
        Row: Usuario;
        Insert: UsuarioInsert;
        Update: UpdateOf<Usuario>;
        Relationships: [];
      };
      personas_cuidadas: {
        Row: PersonaCuidada;
        Insert: PersonaCuidadaInsert;
        Update: UpdateOf<PersonaCuidada>;
        Relationships: [];
      };
      medicamentos: Table<Medicamento>;
      inventario: Table<ItemInventario>;
      registros: {
        Row: Registro;
        Insert: RegistroInsert;
        Update: UpdateOf<Registro>;
        Relationships: [];
      };
      informaciones: Table<Informacion>;
      eventos_recreacion: Table<EventoRecreacion>;
      gastos: Table<Gasto>;
    };
    Views: { [_ in never]: never };
    Functions: {
      current_usuario_id: { Args: Record<string, never>; Returns: string };
      eliminar_mi_cuenta: { Args: Record<string, never>; Returns: undefined };
      crear_gasto_con_item: {
        Args: {
          p_categoria: CategoriaGasto;
          p_nombre: string;
          p_precio: number;
          p_cantidad: number;
          p_lugar: string | null;
          p_fecha: string;
          p_persona_cuidada_id: string | null;
          p_notas: string | null;
          p_umbral_bajo: number;
        };
        Returns: Gasto;
      };
      es_persona_propia: { Args: { p_persona_id: string }; Returns: boolean };
      ajustar_inventario: {
        Args: { p_id: string; p_delta: number };
        Returns: ItemInventario;
      };
    };
    Enums: {
      nivel_dependencia: NivelDependencia;
      tipo_inventario: TipoInventario;
      tipo_registro: TipoRegistro;
      tipo_evento: TipoEvento;
      categoria_gasto: CategoriaGasto;
    };
    CompositeTypes: { [_ in never]: never };
  };
};
