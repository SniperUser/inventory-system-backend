import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const ProductCarousel = ({ items, itemsToShow }) => {
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: itemsToShow || 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
    responsive: [
      {
        breakpoint: 992,
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 1 },
      },
    ],
  };

  return (
    <Slider {...settings}>
      {items.map((item) => (
        <div key={item.id} className="text-center p-2">
          <div className="product-item">
            <img
              src={item.img}
              alt={item.name}
              className="img-fluid"
              style={{ maxHeight: "200px", objectFit: "cover" }}
            />
            <h5 className="mt-2">{item.name}</h5>
            <div>${item.price.toFixed(2)}</div>
            <button className="btn btn-danger mt-2">Add to Cart</button>
          </div>
        </div>
      ))}
    </Slider>
  );
};

export default ProductCarousel;
