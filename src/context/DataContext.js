import React, { createContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { supabase } from '../../lib/supabase';

export const DataContext = createContext();

const DEFAULT_USERS = [
  {
    id: '1',
    usuario: 'cestebanruiz',
    nombreCompleto: 'Cristian Esteban Ruiz',
    correo: 'cestebanruiz@ucundinamarca.edu.co',
    password: 'udec2026',
    cargo: 'Enfermería · Turno Mañana',
  },
  {
    id: '2',
    usuario: 'jalejandroquinones',
    nombreCompleto: 'Jim Alejandro Quiñones',
    correo: 'jalejandroquinones@ucundinamarca.edu.co',
    password: 'udec2026',
    cargo: 'Enfermería · Turno Tarde',
  },
];

const STORAGE_USERS_KEY = 'caredata_users_v1';
const STORAGE_SESSION_KEY = 'caredata_session_v1';

export const DataProvider = ({ children }) => {
  const [registeredUsers, setRegisteredUsers] = useState(DEFAULT_USERS);
  const [currentUser, setCurrentUser] = useState(null);

  const [inventario, setInventario] = useState([]);
  const [atenciones, setAtenciones] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Cargar datos iniciales desde Supabase + sesión local al abrir la app
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [resInv, resAten, resHist, resProv] = await Promise.all([
          supabase.from('inventario').select('*').order('created_at', { ascending: false }),
          supabase.from('atenciones').select('*').order('created_at', { ascending: false }),
          supabase.from('historial').select('*').order('created_at', { ascending: false }),
          supabase.from('proveedores').select('*').order('created_at', { ascending: true }),
        ]);

        if (resInv.data) setInventario(resInv.data);
        if (resAten.data) setAtenciones(resAten.data);
        if (resHist.data) setHistorial(resHist.data);
        if (resProv.data) setProveedores(resProv.data);
      } catch (error) {
        console.error('Error cargando datos de Supabase:', error);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        const savedUsers = window.localStorage.getItem(STORAGE_USERS_KEY);
        if (savedUsers) setRegisteredUsers(JSON.parse(savedUsers));

        const savedSession = window.localStorage.getItem(STORAGE_SESSION_KEY);
        if (savedSession) setCurrentUser(JSON.parse(savedSession));
      } catch (e) {
        console.warn('Error leyendo sesión local:', e);
      }
    }
  }, []);

  // --- FUNCIONES DE AUTENTICACIÓN (Supabase + respaldo local) ---
  const loginUsuario = async (identificador, password) => {
    const idClean = identificador.trim().toLowerCase();
    const passClean = password.trim();

    try {
      const { data } = await supabase
        .from('usuarios')
        .select('*')
        .or(`usuario.ilike.${idClean},correo.ilike.${idClean}`)
        .eq('password', passClean)
        .maybeSingle();

      if (data) {
        setCurrentUser(data);
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(data));
        }
        return { ok: true, user: data };
      }
    } catch (_) {}

    const encontrado = registeredUsers.find(
      (u) =>
        (u.usuario.toLowerCase() === idClean ||
          u.correo.toLowerCase() === idClean) &&
        u.password === passClean
    );

    if (!encontrado) {
      return { ok: false, error: 'Usuario/correo o contraseña incorrectos.' };
    }

    setCurrentUser(encontrado);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(encontrado));
    }
    return { ok: true, user: encontrado };
  };

  const registrarUsuario = async ({ nombreCompleto, usuario, correo, cargo, password }) => {
    const userClean = usuario.trim().toLowerCase();
    const mailClean = correo.trim().toLowerCase();

    const yaExiste = registeredUsers.some(
      (u) => u.usuario.toLowerCase() === userClean || u.correo.toLowerCase() === mailClean
    );
    if (yaExiste) {
      return { ok: false, error: 'Ese usuario o correo institucional ya está registrado.' };
    }

    const nuevoUsuario = {
      usuario: userClean,
      nombreCompleto: nombreCompleto.trim(),
      correo: mailClean,
      cargo: cargo.trim() || 'Personal de Enfermería',
      password: password.trim(),
    };

    try {
      const { data } = await supabase
        .from('usuarios')
        .insert([nuevoUsuario])
        .select()
        .single();
      if (data) nuevoUsuario.id = data.id;
    } catch (_) {}

    if (!nuevoUsuario.id) nuevoUsuario.id = Date.now().toString();

    const listaActualizada = [...registeredUsers, nuevoUsuario];
    setRegisteredUsers(listaActualizada);
    setCurrentUser(nuevoUsuario);

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(listaActualizada));
      window.localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(nuevoUsuario));
    }

    return { ok: true, user: nuevoUsuario };
  };

  const actualizarPassword = async (identificador, nuevaPassword) => {
    const idClean = identificador.trim().toLowerCase();
    const idx = registeredUsers.findIndex(
      (u) => u.usuario.toLowerCase() === idClean || u.correo.toLowerCase() === idClean
    );

    try {
      await supabase
        .from('usuarios')
        .update({ password: nuevaPassword.trim() })
        .or(`usuario.ilike.${idClean},correo.ilike.${idClean}`);
    } catch (_) {}

    if (idx === -1) {
      return { ok: false, error: 'No encontramos ninguna cuenta con ese usuario o correo.' };
    }

    const listaActualizada = [...registeredUsers];
    listaActualizada[idx] = { ...listaActualizada[idx], password: nuevaPassword.trim() };
    setRegisteredUsers(listaActualizada);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(listaActualizada));
    }
    return { ok: true };
  };

  const logoutUsuario = () => {
    setCurrentUser(null);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_SESSION_KEY);
    }
  };

  // Función auxiliar para guardar en el historial
  const registrarMovimiento = async (tipo, cantidad, insumo, obs) => {
    const fechaActual = new Date().toLocaleString('es-CO', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
    const nuevoMovimiento = { fecha: fechaActual, tipo, cantidad, insumo, obs };

    const { data, error } = await supabase.from('historial').insert([nuevoMovimiento]).select();
    if (!error && data) {
      setHistorial((prev) => [data[0], ...prev]);
    }
  };

  // 2. Registrar un insumo en la tabla de inventario
  const agregarInsumo = async (nuevo) => {
    const nuevoItem = {
      codigo: nuevo.codigo,
      nombre: nuevo.nombre,
      categoria: nuevo.categoria,
      stock: parseInt(nuevo.stock || 0, 10),
      stockMinimo: parseInt(nuevo.stockMinimo || 5, 10),
      lote: nuevo.lote || 'N/A',
    };

    const { data, error } = await supabase.from('inventario').insert([nuevoItem]).select();
    if (!error && data) {
      setInventario((prev) => [data[0], ...prev]);
      await registrarMovimiento(
        'Entrada',
        `+${nuevoItem.stock} u.`,
        nuevoItem.nombre,
        'Carga inicial de inventario'
      );
    }
  };

  // 3. Registrar atención médica y descontar insumos del stock
  const registrarAtencion = async (nuevaAtencion, idInsumoUsado) => {
    let insumoSuministrado = 'Ninguno (Solo valoración)';
    let insumoNombre = '';

    if (idInsumoUsado) {
      const insumo = inventario.find((i) => i.id === idInsumoUsado);
      if (insumo) {
        insumoSuministrado = insumo.nombre;
        insumoNombre = insumo.nombre;
        await supabase
          .from('inventario')
          .update({ stock: Math.max(0, insumo.stock - 1) })
          .eq('id', idInsumoUsado);
      }
    }

    const nuevaAtencionDB = {
      paciente: nuevaAtencion.paciente,
      documento: nuevaAtencion.documento,
      rol: nuevaAtencion.rol,
      motivo: nuevaAtencion.motivo,
      insumoSuministrado,
      fecha: new Date().toLocaleDateString('es-CO'),
    };

    const { data, error } = await supabase.from('atenciones').insert([nuevaAtencionDB]).select();

    if (!error && data) {
      setAtenciones((prev) => [data[0], ...prev]);

      if (idInsumoUsado) {
        setInventario((prev) =>
          prev.map((item) =>
            item.id === idInsumoUsado ? { ...item, stock: Math.max(0, item.stock - 1) } : item
          )
        );
        await registrarMovimiento(
          'Salida_Atencion',
          '-1 u.',
          insumoNombre,
          `Suministrado a paciente: ${nuevaAtencion.paciente}`
        );
      }
    }
  };

  // 4. Actualizar stock manualmente
  const actualizarStock = async (id, delta) => {
    const item = inventario.find((i) => i.id === id);
    if (!item) return;

    const nuevoStock = Math.max(0, item.stock + delta);
    const { error } = await supabase.from('inventario').update({ stock: nuevoStock }).eq('id', id);

    if (!error) {
      setInventario((prev) =>
        prev.map((i) => (i.id === id ? { ...i, stock: nuevoStock } : i))
      );
      const tipo = delta > 0 ? 'Entrada' : 'Ajuste';
      await registrarMovimiento(
        tipo,
        `${delta > 0 ? '+' : ''}${delta} u.`,
        item.nombre,
        'Ajuste manual de stock'
      );
    }
  };

  // 5. Eliminar insumo
  const eliminarInsumo = async (id) => {
    const { error } = await supabase.from('inventario').delete().eq('id', id);
    if (!error) {
      setInventario((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // 6. Editar atención médica existente
  const editarAtencion = async (id, datosActualizados, nuevoInsumoId) => {
    const atencionAnterior = atenciones.find((a) => a.id === id);
    const nuevoInsumo = inventario.find((i) => i.id === nuevoInsumoId);
    const nombreInsumoFinal = nuevoInsumo
      ? nuevoInsumo.nombre
      : datosActualizados.insumoSuministrado || 'Ninguno (Solo valoración)';

    const camposActualizados = {
      paciente: datosActualizados.paciente,
      documento: datosActualizados.documento,
      rol: datosActualizados.rol,
      motivo: datosActualizados.motivo,
      insumoSuministrado: nombreInsumoFinal,
    };

    const { error } = await supabase
      .from('atenciones')
      .update(camposActualizados)
      .eq('id', id);

    if (!error) {
      setAtenciones((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...camposActualizados } : item))
      );

      if (
        atencionAnterior &&
        atencionAnterior.insumoSuministrado !== nombreInsumoFinal
      ) {
        const insumoAnteriorObj = inventario.find(
          (i) => i.nombre === atencionAnterior.insumoSuministrado
        );
        if (insumoAnteriorObj) {
          await actualizarStock(insumoAnteriorObj.id, 1);
        }
        if (nuevoInsumo) {
          await actualizarStock(nuevoInsumo.id, -1);
        }
      }
    }
  };

  // 7. Eliminar atención médica
  const eliminarAtencion = async (id) => {
    const { error } = await supabase.from('atenciones').delete().eq('id', id);
    if (!error) {
      setAtenciones((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // 8. CRUD de Proveedores en Supabase
  const agregarProveedor = async (nuevo) => {
    const nuevoProv = {
      empresa: nuevo.empresa,
      telefono: nuevo.telefono,
      correo: nuevo.correo || 'N/A',
      ciudad: nuevo.ciudad || 'Soacha',
    };

    const { data, error } = await supabase.from('proveedores').insert([nuevoProv]).select();
    if (!error && data) {
      setProveedores((prev) => [...prev, data[0]]);
    }
  };

  const editarProveedor = async (id, datosActualizados) => {
    const campos = {
      empresa: datosActualizados.empresa,
      telefono: datosActualizados.telefono,
      correo: datosActualizados.correo || 'N/A',
      ciudad: datosActualizados.ciudad || 'Soacha',
    };

    const { error } = await supabase.from('proveedores').update(campos).eq('id', id);
    if (!error) {
      setProveedores((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...campos } : item))
      );
    }
  };

  const eliminarProveedor = async (id) => {
    const { error } = await supabase.from('proveedores').delete().eq('id', id);
    if (!error) {
      setProveedores((prev) => prev.filter((item) => item.id !== id));
    }
  };

  return (
    <DataContext.Provider
      value={{
        currentUser,
        registeredUsers,
        loginUsuario,
        registrarUsuario,
        actualizarPassword,
        logoutUsuario,
        inventario,
        atenciones,
        historial,
        proveedores,
        loading,
        agregarInsumo,
        registrarAtencion,
        actualizarStock,
        eliminarInsumo,
        editarAtencion,
        eliminarAtencion,
        agregarProveedor,
        editarProveedor,
        eliminarProveedor,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};