const ICONS: [RegExp, string][] = [
  [/wi-?fi|internet/i, "wifi"],
  [/đỗ xe|parking|bãi xe/i, "local_parking"],
  [/hồ bơi|bể bơi|pool/i, "pool"],
  [/ăn sáng|breakfast/i, "free_breakfast"],
  [/tv|truyền hình/i, "tv"],
  [/thú cưng|pet/i, "pets"],
  [/điều hòa|máy lạnh|air/i, "ac_unit"],
  [/gym|thể hình/i, "fitness_center"],
  [/spa|massage/i, "spa"],
  [/nhà hàng|restaurant/i, "restaurant"],
  [/bar/i, "local_bar"],
  [/ban công|balcony/i, "balcony"],
  [/thang máy|elevator/i, "elevator"],
  [/đưa đón|shuttle|sân bay/i, "airport_shuttle"],
  [/giặt|laundry/i, "local_laundry_service"],
  [/két|safe/i, "lock"],
];

export function amenityIcon(name: string) {
  return ICONS.find(([re]) => re.test(name))?.[1] ?? "check_circle";
}
