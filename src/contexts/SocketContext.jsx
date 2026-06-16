import { useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { SocketContext } from './socketContextBase';

const SocketProvider = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (socketRef.current == null) {
      const url =
        import.meta.env.VITE_SOCKET_URL ||
        import.meta.env.VITE_API_BASE_URL ||
        import.meta.env.VITE_API_URL ||
        'http://localhost:5000';
      socketRef.current = io(url, {
        transports: ['websocket'],
      });
      setSocket(socketRef.current);
    }
  }, []);

  useEffect(() => {
    const socketInstance = socketRef.current;
    if (!socketInstance) return;

    // connect once
    if (!socketInstance.connected) {
      socketInstance.connect();
    }

    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);

    socketInstance.on('connect', handleConnect);
    socketInstance.on('disconnect', handleDisconnect);

    return () => {
      socketInstance.off('connect', handleConnect);
      socketInstance.off('disconnect', handleDisconnect);
      // ❌ DO NOT disconnect in dev (StrictMode)
    };
  }, []);

  const value = useMemo(
    () => ({ socket, connected }),
    [socket, connected]
  );

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export { SocketProvider };
export default SocketProvider;
