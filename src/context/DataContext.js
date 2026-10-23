import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase'; // Asegúrate de que la ruta a tu carpeta lib sea correcta

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [inventario, setInventario] = useState([]);
  const [atenciones, setAtenciones] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Cargar datos iniciales desde Supabase al abrir la app
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [resInv, resAten, resHist] = await Promise.all([
          supabase.from('inventario').select('*').order('created_at', { ascending: false }),
          supabase.from('atenciones').select('*').order('created_at', { ascending: false }),
          supabase.from('historial').select('*').order('created_at', { ascending: false }),
        ]);

        if (resInv.data) setInventario(resInv.data);
        if (resAten.data) setAtenciones(resAten.data);
        if (resHist.data) setHistorial(resHist.data);
      } catch (error) {
        console.error("Error cargando datos de Supabase:", error);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  // Función auxiliar para guardar en el historial
  const registrarMovimiento = async (tipo, cantidad, insumo, obs) => {
    const fechaActual = new Date().toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });
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
      // Guardar automáticamente en el historial
      await registrarMovimiento('Entrada', `+${nuevoItem.stock} u.`, nuevoItem.nombre, 'Carga inicial de inventario');
    }
  };

  // 3. Registrar atención médica y descontar insumos del stock
  const registrarAtencion = async (nuevaAtencion, idInsumoUsado) => {
    let insumoSuministrado = 'Ninguno (Solo valoración)';
    let insumoNombre = '';

    // Si se usó un insumo, buscarlo para restar stock
    if (idInsumoUsado) {
      const insumo = inventario.find((i) => i.id === idInsumoUsado);
      if (insumo) {
        insumoSuministrado = insumo.nombre;
        insumoNombre = insumo.nombre;
        // Actualizar stock en la base de datos
        await supabase.from('inventario').update({ stock: Math.max(0, insumo.stock - 1) }).eq('id', idInsumoUsado);
      }
    }

    const nuevaAtencionDB = {
      paciente: nuevaAtencion.paciente,
      documento: nuevaAtencion.documento,
      rol: nuevaAtencion.rol,
      motivo: nuevaAtencion.motivo,
      insumoSuministrado: insumoSuministrado,
      fecha: new Date().toLocaleDateString('es-CO'),
    };

    const { data, error } = await supabase.from('atenciones').insert([nuevaAtencionDB]).select();
    
    if (!error && data) {
      setAtenciones((prev) => [data[0], ...prev]);
      
      // Si se usó un insumo, actualizamos el estado local y guardamos en historial
      if (idInsumoUsado) {
        setInventario((prev) =>
          prev.map((item) =>
            item.id === idInsumoUsado ? { ...item, stock: Math.max(0, item.stock - 1) } : item
          )
        );
        await registrarMovimiento('Salida_Atencion', '-1 u.', insumoNombre, `Suministrado a paciente: ${nuevaAtencion.paciente}`);
      }
    }
  };

  // 4. Actualizar stock manualmente (+1 o -1)
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
      await registrarMovimiento(tipo, `${delta > 0 ? '+' : ''}${delta} u.`, item.nombre, 'Ajuste manual de stock');
    }
  };

  // 5. Eliminar insumo
  const eliminarInsumo = async (id) => {
    const { error } = await supabase.from('inventario').delete().eq('id', id);
    if (!error) {
      setInventario((prev) => prev.filter((item) => item.id !== id));
    }
  };

  return (
    <DataContext.Provider
      value={{
        inventario,
        atenciones,
        historial,
        loading,
        agregarInsumo,
        registrarAtencion,
        actualizarStock,
        eliminarInsumo,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};