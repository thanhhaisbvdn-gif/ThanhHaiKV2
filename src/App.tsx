import * as React from 'react';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  Download, 
  RefreshCw, 
  User, 
  CheckCircle2, 
  AlertCircle,
  Image as ImageIcon,
  Sparkles,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster } from '@/components/ui/sonner';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { processPortrait } from '@/lib/gemini';
import confetti from 'canvas-confetti';

export default function App() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mimeType, setMimeType] = useState<string>('');
  const [costumeType, setCostumeType] = useState<string>('vest');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng tải lên một tệp hình ảnh.');
        return;
      }
      
      setMimeType(file.type);
      const reader = new FileReader();
      reader.onload = (event) => {
        setOriginalImage(event.target?.result as string);
        setProcessedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcess = async () => {
    if (!originalImage) return;

    setIsProcessing(true);
    toast.info('Đang xử lý ảnh chân dung của bạn...');
    
    try {
      const result = await processPortrait(originalImage, mimeType, costumeType);
      setProcessedImage(result);
      toast.success('Xử lý ảnh thành công!');
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#ffffff', '#1e3a8a']
      });
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra khi xử lý ảnh. Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!processedImage) return;
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = `kv2-portrait-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Đã tải ảnh về máy!');
  };

  const reset = () => {
    setOriginalImage(null);
    setProcessedImage(null);
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      <Toaster position="top-center" />
      
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="bg-blue-600 text-white py-2 text-center text-xs font-bold tracking-widest uppercase">
          TẠO ẢNH CHÂN DUNG MẶC ĐỒ CÔNG SỞ
        </div>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                <User size={20} />
              </div>
              <span className="font-bold text-xl tracking-tight">KV2- Hình chân dung</span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium ml-10 -mt-1">Đơn vị phát triển: @Thanh Hải - KV2</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-blue-600 transition-colors">Tính năng</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Hướng dẫn</a>
          </nav>
          <Button variant="outline" size="sm" className="rounded-full">
            Đăng nhập
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12 md:py-16">
        {/* Costume Selection */}
        <div className="flex flex-col items-center mb-12">
          <div className="max-w-md w-full bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 flex items-start gap-3">
            <AlertCircle className="text-blue-600 shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-blue-800 leading-relaxed">
              Hãy tải lên một tấm ánh chân dung rõ khuôn mặt để chương trình tạo ảnh chân dung được đẹp nhất.
            </p>
          </div>
          <span className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">Lựa chọn trang phục</span>
          <Tabs defaultValue="vest" onValueChange={setCostumeType} className="w-full max-w-md">
            <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-slate-100 rounded-xl">
              <TabsTrigger value="shirt" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Áo sơ mi
              </TabsTrigger>
              <TabsTrigger value="vest" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Áo vest
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <p className="text-xs text-slate-400 mt-3 italic">
            {costumeType === 'shirt' ? '* Áo sơ mi trắng có đeo Cavat' : '* Áo vest chữ V, có gile và sơ mi bên trong, đeo Cavat'}
          </p>
        </div>

        {/* Main Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left: Upload/Original */}
          <Card className="border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6 border-b bg-slate-50/50 flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <ImageIcon size={18} className="text-blue-600" />
                  Ảnh gốc
                </h3>
                {originalImage && (
                  <Button variant="ghost" size="sm" onClick={reset} className="text-slate-500 hover:text-red-600">
                    Xóa ảnh
                  </Button>
                )}
              </div>
              
              <div className="p-8">
                {!originalImage ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 rounded-2xl p-12 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all group"
                  >
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                      <Upload size={32} />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-slate-700">Nhấp để tải lên hoặc kéo thả</p>
                      <p className="text-sm text-slate-500 mt-1">PNG, JPG hoặc WebP (Tối đa 5MB)</p>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      className="hidden" 
                      accept="image/*"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    <div className="relative rounded-xl overflow-hidden bg-slate-100 aspect-[3/4] flex items-center justify-center">
                      <img 
                        src={originalImage} 
                        alt="Original" 
                        className="max-h-full w-auto object-contain"
                      />
                    </div>
                    {!processedImage && !isProcessing && (
                      <Button onClick={handleProcess} className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg font-semibold shadow-lg">
                        Tạo ảnh <ArrowRight size={20} className="ml-2" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Right: Result */}
          <Card className="border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden min-h-[500px]">
            <CardContent className="p-0 h-full flex flex-col">
              <div className="p-6 border-b bg-slate-50/50 flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <Sparkles size={18} className="text-amber-500" />
                  Kết quả đầu ra:
                </h3>
                {processedImage && (
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    Chất lượng HD
                  </Badge>
                )}
              </div>

              <div className="p-8 flex-grow flex flex-col items-center justify-center">
                <AnimatePresence mode="wait">
                  {isProcessing ? (
                    <motion.div 
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-full space-y-4"
                    >
                      <Skeleton className="w-full aspect-[3/4] rounded-xl bg-slate-200 animate-pulse" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-3/4 mx-auto bg-slate-200" />
                        <Skeleton className="h-4 w-1/2 mx-auto bg-slate-200" />
                      </div>
                      <p className="text-center text-sm text-slate-500 animate-bounce mt-4">
                        AI đang thiết kế trang phục và làm đẹp da...
                      </p>
                    </motion.div>
                  ) : processedImage ? (
                    <motion.div 
                      key="result"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full flex flex-col items-center gap-6"
                    >
                      <div className="relative rounded-xl overflow-hidden shadow-2xl shadow-slate-900/20 aspect-[3/4] bg-[#e5e7eb] flex items-center justify-center border-4 border-white">
                        <img 
                          src={processedImage} 
                          alt="Processed" 
                          className="max-h-full w-auto object-contain"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                        <Button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700">
                          <Download size={18} className="mr-2" /> Tải ảnh về
                        </Button>
                        <Button variant="outline" onClick={handleProcess}>
                          <RefreshCw size={18} className="mr-2" /> Tạo lại ảnh
                        </Button>
                        <Button variant="secondary" onClick={reset} className="sm:col-span-2">
                          <RotateCcw size={18} className="mr-2" /> Bắt đầu lại
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <div key="placeholder" className="text-center text-slate-400 py-20">
                      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Sparkles size={32} />
                      </div>
                      <p>Tải ảnh lên và nhấn "Tạo ảnh" để xem kết quả</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white">
              <User size={14} />
            </div>
            <span className="font-bold text-lg tracking-tight">KV2- Hình chân dung</span>
          </div>
          <p className="text-slate-500 text-sm">© 2026 @Thanh Hải - KV2. Tất cả quyền được bảo lưu.</p>
          <div className="flex gap-6 text-slate-400">
            <a href="#" className="hover:text-blue-600 transition-colors"><AlertCircle size={20} /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}
