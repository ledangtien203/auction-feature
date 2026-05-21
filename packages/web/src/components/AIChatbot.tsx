import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const AI_RESPONSES: { [key: string]: string } = {
  default:
    'Xin chào! Tôi là trợ lý AI của hệ thống đấu giá. Tôi có thể giúp bạn tìm kiếm sản phẩm, giải đáp thắc mắc về quy trình đấu giá, hoặc hỗ trợ các vấn đề liên quan đến tài khoản.',
  'đấu giá':
    "Để tham gia đấu giá, bạn cần: 1) Đăng ký tài khoản, 2) Xem chi tiết sản phẩm, 3) Đặt giá cao hơn giá hiện tại ít nhất bằng bước giá tối thiểu. Bạn có thể theo dõi các sản phẩm yêu thích trong phần 'Của tôi'.",
  'thanh toán':
    'Chúng tôi hỗ trợ nhiều phương thức thanh toán an toàn: chuyển khoản ngân hàng, ví điện tử, và thẻ tín dụng. Sau khi thắng đấu giá, bạn sẽ nhận được hướng dẫn thanh toán qua email.',
  'giao hàng':
    'Thời gian giao hàng từ 3-7 ngày làm việc tùy theo khu vực. Chúng tôi hợp tác với các đơn vị vận chuyển uy tín và bảo hiểm toàn bộ hàng hóa trong quá trình vận chuyển.',
  'tài khoản':
    "Bạn có thể quản lý tài khoản trong phần 'Của tôi' để xem lịch sử đấu giá, sản phẩm đang theo dõi, và cập nhật thông tin cá nhân.",
  giá: "Giá hiện tại là giá cao nhất có người đặt. Bạn cần đặt giá cao hơn ít nhất bằng 'Bước giá tối thiểu' để tham gia đấu giá. Người đặt giá cao nhất khi hết thời gian sẽ thắng đấu giá.",
};

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Xin chào! Tôi có thể giúp gì cho bạn?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollTop + 1000;
    }
  }, [messages]);

  const getAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    for (const [key, response] of Object.entries(AI_RESPONSES)) {
      if (lowerMessage.includes(key)) {
        return response;
      }
    }

    if (
      lowerMessage.includes('xin chào') ||
      lowerMessage.includes('hello') ||
      lowerMessage.includes('hi')
    ) {
      return AI_RESPONSES.default;
    }

    return 'Cảm ơn câu hỏi của bạn! Tôi sẽ ghi nhận và đội ngũ hỗ trợ sẽ liên hệ sớm nhất. Bạn có thể hỏi tôi về: quy trình đấu giá, thanh toán, giao hàng, hoặc quản lý tài khoản.';
  };

  const fetchAiReply = async (message: string) => {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Lỗi API: ${response.status}`);
    }

    const data = await response.json();
    return data.reply || '';
  };

  const handleSendMessage = async () => {
    const messageText = inputText.trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const replyText = await fetchAiReply(messageText);
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: replyText || getAIResponse(messageText),
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi kết nối AI';
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: `${getAIResponse(messageText)}\n\n(${errorMessage})`,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-accent hover:bg-accent/90 z-50"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-card border border-border rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">
          <div className="bg-accent text-accent-foreground p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-accent-foreground/10 flex items-center justify-center">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Trợ lý AI</h3>
                <p className="text-xs opacity-80">Luôn sẵn sàng hỗ trợ</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 hover:bg-accent-foreground/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="flex-1 min-h-0 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.sender === 'bot' && (
                    <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-accent" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                      message.sender === 'user' ? 'bg-accent text-accent-foreground' : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.sender === 'user'
                          ? 'text-accent-foreground/60'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  {message.sender === 'user' && (
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-2 justify-start">
                  <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-accent" />
                  </div>
                  <div className="bg-muted rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce"></div>
                      <div className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce delay-100"></div>
                      <div className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Nhập câu hỏi của bạn..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputText.trim()}
                className="bg-accent hover:bg-accent/90"
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
