const XLSX = require('xlsx');
const fs = require('fs');

const parseExcelFile = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error('El archivo no existe');
    }

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (!data || data.length === 0) {
      throw new Error('El archivo Excel está vacío');
    }

    const validatedData = [];
    const errors = [];

    data.forEach((row, index) => {
      const rowNumber = index + 2;
      
      if (!row.telefono && !row.Telefono && !row.TELEFONO && !row.phone) {
        errors.push(`Fila ${rowNumber}: Falta la columna 'telefono'`);
        return;
      }

      if (!row.mensaje && !row.Mensaje && !row.MENSAJE && !row.message) {
        errors.push(`Fila ${rowNumber}: Falta la columna 'mensaje'`);
        return;
      }

      const telefono = (row.telefono || row.Telefono || row.TELEFONO || row.phone || '').toString().trim();
      const mensaje = (row.mensaje || row.Mensaje || row.MENSAJE || row.message || '').toString().trim();

      if (!telefono) {
        errors.push(`Fila ${rowNumber}: El teléfono está vacío`);
        return;
      }

      if (!mensaje) {
        errors.push(`Fila ${rowNumber}: El mensaje está vacío`);
        return;
      }

      const cleanPhone = telefono.replace(/\D/g, '');
      
      if (cleanPhone.length < 10 || cleanPhone.length > 15) {
        errors.push(`Fila ${rowNumber}: El teléfono '${telefono}' no tiene un formato válido`);
        return;
      }

      validatedData.push({
        telefono: cleanPhone,
        mensaje: mensaje
      });
    });

    fs.unlinkSync(filePath);

    return {
      success: errors.length === 0,
      data: validatedData,
      errors: errors,
      totalRows: data.length,
      validRows: validatedData.length
    };

  } catch (error) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw error;
  }
};

module.exports = { parseExcelFile };
