import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

const OfferCarousel = ({
  offers = [],
  interval = 5000,
  brandColor = "#1db0a4",
  accentColor = "#FB7185",
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "center", skipSnaps: false },
    [
      Autoplay({
        delay: interval,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    ]
  );

  const scrollTo = useCallback(
    (i) => emblaApi && emblaApi.scrollTo(i),
    [emblaApi]
  );
  const onSelect = useCallback(() => {
    if (emblaApi) setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  if (!offers.length) {
    return <p className="text-gray-500">No travel deals at the moment.</p>;
  }

  return (
    <div className="relative max-w-5xl mx-auto" aria-roledescription="carousel">
      {/* Viewport */}
      <div
        className="overflow-hidden rounded-2xl border border-[#E5E7EB]"
        ref={emblaRef}
      >
        <div className="flex">
          {offers.map((offer) => {
            const bgImage = offer.hotelId?.image;
            return (
              <div key={offer._id} className="flex-[0_0_100%]">
                <div className="relative h-52 md:h-60 w-full overflow-hidden">
                  {bgImage && (
                    <img
                      src={bgImage}
                      alt={offer.hotelId?.name || "Offer"}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                  {/* Gradient overlay via inline style (no Tailwind dynamic class) */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(90deg, ${brandColor})`,
                      mixBlendMode: "multiply",
                    }}
                  />
                  <div className="relative z-10 p-5 text-white flex flex-col justify-center md:items-center h-full">
                    <h3 className="text-xl sm:text-2xl font-bold mb-1">
                      🎁
                      {offer.description ||
                        (offer.discountPercent
                          ? `Get ${offer.discountPercent}% off!`
                          : `Flat ₹${offer.discountFlat} off!`)}
                    </h3>
                    <p className="text-sm/6 opacity-95">
                      Use code{" "}
                      <strong className="px-2 py-0.5 rounded bg-white/15 ">
                        {offer.code}
                      </strong>
                      {" · "}Valid until{" "}
                      {new Date(offer.validTo).toLocaleDateString()}
                      {offer.hotelId?.name ? ` · ${offer.hotelId.name}` : ""}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dots */}
      {offers.length > 1 && (
        <div className="flex justify-center mt-3 space-x-2">
          {offers.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              aria-label={`Go to offer ${i + 1}`}
              className="w-2.5 h-2.5 rounded-full transition"
              style={{
                backgroundColor: i === selectedIndex ? brandColor : "#E5E7EB",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default OfferCarousel;
