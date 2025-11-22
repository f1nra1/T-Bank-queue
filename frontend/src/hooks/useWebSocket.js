import { useEffect, useRef } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_WS_URL || 'http://localhost:5001';

function useWebSocket(eventName, callback) {
  const socketRef = useRef(null);

  useEffect(() => {
    // Создаем подключение
    console.log('🔌 Подключение к WebSocket:', SOCKET_URL);
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    // Обработчик подключения
    socketRef.current.on('connect', () => {
      console.log('✅ WebSocket подключен:', socketRef.current.id);
    });

    // Обработчик отключения
    socketRef.current.on('disconnect', () => {
      console.log('❌ WebSocket отключен');
    });

    // Подписываемся на событие
    if (eventName && callback) {
      socketRef.current.on(eventName, (data) => {
        console.log(`📨 WebSocket событие '${eventName}':`, data);
        callback(data);
      });
    }

    // Cleanup при размонтировании
    return () => {
      if (socketRef.current) {
        console.log('🔌 Закрытие WebSocket подключения');
        socketRef.current.disconnect();
      }
    };
  }, [eventName, callback]);

  // Функция для отправки событий
  const emit = (event, data) => {
    if (socketRef.current) {
      console.log(`📤 WebSocket отправка '${event}':`, data);
      socketRef.current.emit(event, data);
    }
  };

  return { socket: socketRef.current, emit };
}

export default useWebSocket;