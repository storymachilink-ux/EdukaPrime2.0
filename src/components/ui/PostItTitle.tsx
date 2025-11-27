interface PostItTitleProps {
  title: string;
  description?: string;
}

export function PostItTitle({ title, description }: PostItTitleProps) {
  return (
    <div className="mb-12 inline-block">
      <div className="relative">
        <div className="relative bg-[#FFF3D6] border-2 border-[#FFE3A0] rounded-2xl px-8 py-4 shadow-lg transform rotate-[-1deg] hover:rotate-0 transition-transform duration-300">
          {/* Bolinhas marrons nos cantos (efeito real da Landing) */}
          <div className="absolute top-0 left-0 w-3 h-3 bg-[#9A6A00] rounded-full transform -translate-x-1 -translate-y-1"></div>
          <div className="absolute top-0 right-0 w-3 h-3 bg-[#9A6A00] rounded-full transform translate-x-1 -translate-y-1"></div>
          <div className="absolute bottom-0 left-0 w-3 h-3 bg-[#9A6A00] rounded-full transform -translate-x-1 translate-y-1"></div>
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#9A6A00] rounded-full transform translate-x-1 translate-y-1"></div>

          {/* Texto destacado */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#9A6A00] relative z-10">
            {title}
          </h1>
          {description && (
            <p className="text-lg text-[#9A6A00]/80 mt-2 relative z-10">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
