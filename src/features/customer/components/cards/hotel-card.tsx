import {
  CardBody,
  CardFooter,
  CardFrame,
  CardImage,
  firstImage,
  formatVnd,
  type Money,
} from "./card-parts";

export type HotelCardData = {
  name: string;
  images: unknown;
  amenities: string[];
  rooms: { basePrice: Money }[];
  province: { name: string };
};

export function HotelCard({ hotel }: { hotel: HotelCardData }) {
  const prices = hotel.rooms.map((room) => Number(room.basePrice.toString()));
  const minPrice = prices.length ? Math.min(...prices) : null;

  return (
    <CardFrame>
      <CardImage alt={hotel.name} src={firstImage(hotel.images)} />
      <CardBody
        chips={[
          { icon: "home", label: `${hotel.rooms.length} loại phòng` },
          { icon: "sparkle", label: `${hotel.amenities.length} tiện nghi` },
        ]}
        location={hotel.province.name}
        title={hotel.name}
      >
        <CardFooter
          label={minPrice != null ? "Từ" : "Xem chi tiết"}
          price={minPrice != null ? formatVnd(minPrice) : null}
          unit="/ đêm"
        />
      </CardBody>
    </CardFrame>
  );
}
