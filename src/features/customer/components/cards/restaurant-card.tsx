import {
  CardBody,
  CardFooter,
  CardFrame,
  CardImage,
  firstImage,
} from "./card-parts";

export type RestaurantCardData = {
  name: string;
  images: unknown;
  capacity: number;
  province: { name: string };
};

export function RestaurantCard({
  restaurant,
}: {
  restaurant: RestaurantCardData;
}) {
  return (
    <CardFrame>
      <CardImage alt={restaurant.name} src={firstImage(restaurant.images)} />
      <CardBody
        chips={[
          { icon: "user", label: `Sức chứa ${restaurant.capacity}` },
          { icon: "calendar", label: "Đặt bàn trước" },
        ]}
        location={restaurant.province.name}
        title={restaurant.name}
      >
        <CardFooter label="Xem chi tiết" />
      </CardBody>
    </CardFrame>
  );
}
