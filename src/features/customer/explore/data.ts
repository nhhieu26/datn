export type Destination = {
  name: string;
  tags: string;
  rating: number;
  reviews: string;
  image: string;
};

export type Hotel = {
  name: string;
  area: string;
  rating: number;
  reviews: string;
  price: number;
  image: string;
};

export type Restaurant = {
  name: string;
  area: string;
  rating: number;
  reviews: string;
  priceLevel: string;
  image: string;
};

export type Tour = {
  name: string;
  rating: number;
  reviews: string;
  price: number;
  image: string;
};

const IMG = "https://lh3.googleusercontent.com/aida-public/";

export const EXPLORE_HERO_IMAGE = `${IMG}AB6AXuAycuF6uAhD4ApIUtlm-pISOwziI8uNelxUzXlL4qdQcN-OSWgixq4a9sWp0DVblyEEIUXjWYlA146Rq2dZoNuC1r3pYKeFmVXo85EdiQ9T5eGSyMotpPv2_hdY2ORF5ppJaeX0ETR93QB2TVoQiJLrPuGgItbrgJMKET9bg5-O6PTDSvBuXjtleuqODaiRLp9riMEW8fhs3oG1K5OnCTrY2rPbKphuKigvZx_6Fu83ZKh8cAeB3h_L`;

export const DESTINATIONS: Destination[] = [
  {
    name: "Ubud",
    tags: "Văn hóa • Thiên nhiên • Wellness",
    rating: 4.8,
    reviews: "1.2K",
    image: `${IMG}AB6AXuCryEfQhTbiZijyGc7VuSxhObcjozExhQ6SF5horNYSGBpbs5TLjcfQDYR51AH5KYGpipoSZ5ZpJ0_BxIpI3V2DsP_1P5is8iWBHPdOmvKKrTT7XhKToRlgFuOMpY0QlTClZMTW-PuSUMk0TSGtkbC14UAPK5Lgxm4jKMTcY3vtRH-p0aALYB3wWihBTX7unhMMLmP3wuE8nYfyKyPV32ICVEMq0hIiyxrST_Gye6iF78WlCPELslkP`,
  },
  {
    name: "Uluwatu",
    tags: "Bãi biển • Vách đá • Hoàng hôn",
    rating: 4.7,
    reviews: "892",
    image: `${IMG}AB6AXuCaj38aihTivWV7o8h5dHu0JC6CtIxtHvw870WG1gDdJKIbbrMKJmEYhyJHmg12OGA4kjKeEE_d4Mao1Dov1rKmZWfndX89enZPMhoD1UapPg7cromQgppyCmtMeC0DXzb6TcaSOJYuWfI9VqywuSRJg0aHnPAfqgm5G36cFrGCTO-KlpZ-aERhMaOoDCqEY_xg_9yG_zEqHmpgSLHC73AITszRpt90b0qOvokqVkHi-apBGarNw2q4`,
  },
  {
    name: "Canggu",
    tags: "Bãi biển • Quán cà phê • Nightlife",
    rating: 4.6,
    reviews: "745",
    image: `${IMG}AB6AXuA7qhDQx63Ald_MiN7O5KefeQe7Ww1eCUNdynepmlXIb5uBRS9rsh-CwefCigKPL4fPiUoungEjKuOOhf15EBp-NYak4vS61VcrwJXdwppp_n4ZmEQ7FekTAw-ljZaQ6HCu5ZvXz0t6gq4Hr3ok2k54ka4uI4TvJBSfAfSy5Dd4MJP8RBpuLvl6rGrDeuDJfBhHbvTSfnntDcjUcxyKMRBbmkgWAXnh3-BBWdviyjtuVBD6-cJ3Hlje`,
  },
  {
    name: "Nusa Penida",
    tags: "Đảo • Lặn ống thở • Thiên nhiên",
    rating: 4.8,
    reviews: "620",
    image: `${IMG}AB6AXuDtWpDchDxZvodQOCm9t18wXNw9-FPdUh1vcxo4ftMUdy6mW0PZDcv_Y_zIs01AQiMR7PXadQzGjVchEk3wcpFML3H7D9iLAu_uaaD7qbZN7cL0gQlJC15sSf6t7pIIiLAUsfldKZv46MB8P78HJTbHTfXmai8l2LefwQ8uRDHZgDxfLNzz60Ymacse_HfASYiKndpsVtAmv0-VhZj_k1hQ03GpvsuIGLUKWOzPM9a0Kl9rkB16YJ--`,
  },
];

export const HOTELS: Hotel[] = [
  {
    name: "The Kayon Jungle Resort",
    area: "Ubud",
    rating: 4.9,
    reviews: "1.1K",
    price: 220,
    image: `${IMG}AB6AXuAQQWu4VczuT8Ax0h3RlbuYw1bFH2KHNfI7V8gMwfvuILMF07QQPEQVQ4Uz9RnxTTKybP2YZa1mBUv8DU6Yj5UQwloAhc1oJ6v24WE4qOANWENby7iMDgnLgUgFnwXIaHUoPtpe4FfocyZIOdCVdaIJ32T6ibNV_nBdiLjl-HRf3o_PLPr4dfuT6G-rGjJPfMI_MhMPm9PPDkx99C2xnOBY0QeAs89fs0n7tyEpcAtli_KCF_Zhh9Gy`,
  },
  {
    name: "COMO Uma Canggu",
    area: "Canggu",
    rating: 4.7,
    reviews: "632",
    price: 340,
    image: `${IMG}AB6AXuCxjYeJiZLSfgLewPFu7V4_5E3Aox50SCiCmwgxjNrHeEitwWjVVPo1ISdBw873qJdueOecPR6WP24bZej3_M_9aQip27YEmvLkwPFBAE312uTH0yoTN_6pUZtJ7VCmPECL60yG0AtCwvulrw8HWuFyje28dUZSKXl1WiWSf09tmEhejokZ7qvZemoYrORn1W1re6Flndaf-LxbPnTcMGEcjZbIc4NxHiGzAyzQioRgCJUZ5NZnGKLB`,
  },
  {
    name: "Six Senses Uluwatu",
    area: "Uluwatu",
    rating: 4.8,
    reviews: "421",
    price: 620,
    image: `${IMG}AB6AXuD7WTEVn0A_DPT2QslbFBRTnYP0aFo5apWuj-dsoa56D5F2hAFhqOsoDx6kdZiOrxpZnRNQ-01LaPLZZmGzK4q-r_d-8nbeeJNOG89oF6XygRTs-XC_aZ8c0jP6HuIRmsx5w22jk0Lie470MQcz13josLCYT_kgicLcw80IK6Gv6luwiCN7Bk4dBIKK5paOmQqjpn4OctQ4QXosNVpYOlAbA2ecWICOMesj7wnaOGpnSKE9UoVgbips`,
  },
  {
    name: "Ayana Resort Bali",
    area: "Jimbaran",
    rating: 4.6,
    reviews: "892",
    price: 480,
    image: `${IMG}AB6AXuDjl_NpeXFdUCHM5LVcLXjYQ6l7GOuIJ3lZhv6jFAzLtT4Qgas2vfio6vLjzXJbHaxs6-m3Azx9nKmi0xNgDP6LSx6isMZYWvl1sdCsCvmtJQm8qbNu8zNf4K1kSMhVdFKLmiaTDZZB3pyKRV0Sup2avKu5rVvZhEg52cKsCD8PPcyhEf4AwXC5un9LQYlA_H0liR2QwpLggjVhHmFUL2OMyYdxJEyY-oTLUIZ0OUHoT41VFT1IGpc7`,
  },
];

export const RESTAURANTS: Restaurant[] = [
  {
    name: "Locavore",
    area: "Ubud",
    rating: 4.8,
    reviews: "1.2K",
    priceLevel: "$$$",
    image: `${IMG}AB6AXuCL6YhT6Mt8H1RsOlCZ4ThQ-jL_D3oINRpMSbw-aOEbBkChS2pGOMRodLU81GzI4fSkQuFc0nOtsW5wUGLxpdiFg8FIT_WnVCbzMEslSuo8RuBiYPYBRtJ_R4VY-A4xaF3BcldOGxVgFx179DfyxzK8EwjLUEoR-idc6zfYBD-N0_Ab8ybSibieY6Md4W6pshG1FAgMcLF7TEF2XxlL0mJeamxglXjHWMR4dEhaJZzoCXFInmAN0iG2`,
  },
  {
    name: "La Brisa",
    area: "Canggu",
    rating: 4.6,
    reviews: "984",
    priceLevel: "$$",
    image: `${IMG}AB6AXuCm-YzEZ7BasnvsOcoHnblbJJPOEQ9OR5zngImg0py7ocEjzqkUCFqMJbzoq9twKO8UBAKB33RVWieo0YvlSB1E5pF3wgJEGhl5Fg-Rk4CJGeMyaMXckrIEJ5KNN_ZABS7tPf5iQjYzcbZEt7gQFNOI3dUEvUj8Hevb1Sh9AvGlSzyQ06pXF0vspKOmL4PiSNwebB-5EEY5RDPsXa41n13wTbGsGcCk3GBesxWl48oXRaqbE6E4Czwt`,
  },
  {
    name: "Sundara",
    area: "Jimbaran",
    rating: 4.7,
    reviews: "721",
    priceLevel: "$$$",
    image: `${IMG}AB6AXuD3d3LFql08Aa5IQSIORdMmyThrqpEyV8j_6zBJbgwqdYg-JdOxbjuEK_ZkXudH40_od_t1xym4qtsyg0S5qUGg3MdAIj69e6vgMvxKUJhPkUOo0uNRwC9ekXDjJQqhzhDcGUhzWssaWT2yzSakOeeOPjp4eihsUavltLMp6ZjeCIsLU02pdN8VEJgbPikcy2ImMpK3ulK0apu2F0ZChkS_Yt7FRqo0pG5uoZIC3MdNUa-3oGFR9yBT`,
  },
  {
    name: "CasCades",
    area: "Ubud",
    rating: 4.5,
    reviews: "632",
    priceLevel: "$$",
    image: `${IMG}AB6AXuDChXQ1wtRmIC4Fy-llBbnAt5DkrVCE2GSFjU4zDgBJCN4PoQyiNJPzo7SPrL5n5EyT03QEtiSYjK3jjLcj7KdApLG4jEbg7Q-na6fGMYJbPZSGPBUHXEgkYWEFZoPfOgAWncpp236ZXvYyDfUmkeGrGVn0sz8LCYYathXxD6r3-2QB2OD8zbaCXtHCszHAVLk1BQFuUhnZqYA3mOowCMe8mFpBuVMdNoebacC4Y7Ypvzba4BKsIMds`,
  },
];

export const TOURS: Tour[] = [
  {
    name: "Nusa Penida Day Tour",
    rating: 4.8,
    reviews: "1.4K",
    price: 95,
    image: `${IMG}AB6AXuBXEyYIfFystoNaUw1Mo0UxKIN854Ql3MCcUO9GOAMsxgSydQhfiiHHLfUh2x-q_fTot6Ebm3JKUqC3lsdtx9ghcUrEINOWObnwZTS53DtJkbGx7C-UAoX7viDewu2J-77toAiKLT_hawUa1yfUNbjjebpEwVjgC78jeZWDubJdbAzTxuy1Q85TQB_4NYqjVFu4-cN4Kyls671rkFDyb4bHpQp5-DZyR_rNPsVcgokuKMNm35RY_bIc`,
  },
  {
    name: "Mount Batur Sunrise Trek",
    rating: 4.7,
    reviews: "983",
    price: 70,
    image: `${IMG}AB6AXuAKPM-ZDWtnq-huNPPGJRphYI-n8r-RpViOxFJd2GYaS0FohVfPwwHQkdfuDm57uioec8aN2vnNa4Kwphf3r1L0fG8dvsOmdF2yc9bBqQnLxjE1d8gp2DJjOzlf-QtElUhEnZIwMo3s2OGL46WAERTew1h04V8nbrEAhDaYRI3hbW9s7-oITPvxzY-MnQRsW7ZuaHoGRvQukm8zi2p0Jo0RMHmKOho2tfUC3Y9mV4L2nHST79T_ViYg`,
  },
  {
    name: "Bali Cooking Class",
    rating: 4.6,
    reviews: "721",
    price: 65,
    image: `${IMG}AB6AXuBouX1dnMgozK7wZC3cnl9YGcV_SWlLu-d3oO4IaPSdBOeJlfkUy_24AG8UTofHEA_beYrx_PHzaxgkHOEwl1ukPS10xU2apBc0-h_XZ2BzNuRtKaCezMC8aldgtqvvimDlsujtI7r48jDbhBKsixWfJF9pAUoxn5y9rN5dk58yJUSBhM-G8MWD1fu069_m8YOR44Q-mHvl5kdL0Vt2wvZUqlcm4Z-im8lR4Y4CZrETfaNtqbxuuWA7`,
  },
  {
    name: "Ubud Rice Terrace Tour",
    rating: 4.8,
    reviews: "892",
    price: 55,
    image: `${IMG}AB6AXuCy6gu_LxxmVrTBMTS6bKSqKSfMxqujzpWzsDRozH8GOtyHuIL_r-xGvwhc66PxsKjZVG3VkxNJyxflt-zjpsZK-DkByIpzpCFIy-hbqD92zG5tdAaQ_flUr8dDQgRo47eC_wnleUdqcWo_YZvbuaqdASCWxnfr61YGvvXlym5Mx8IIHiXO-lNgYHqodeQRMvLi5GsBo8nDTPRrNKadSRakszUlfA8HmtspJBnfmkB9sIQ9nkFhy6UT`,
  },
];
