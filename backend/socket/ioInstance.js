// Simple singleton to share the Socket.IO server instance across modules
let ioInstance = null;

export function initIo(io) {
  ioInstance = io;
}

export function getIo() {
  if (!ioInstance) {
    throw new Error('Socket.IO instance has not been initialised yet');
  }
  return ioInstance;
}

