const { Link } = ReactRouterDOM

export function CarPreview({ car }) {
    return (
        <article className="car-preview">
            <h2>Car Vendor: {car.vendor}</h2>
            <h4>Car Speed: {car.speed}</h4>
            {car.owner && 
                <h4>
                    Owner: <Link to={`/user/${car.owner._id}`}>{car.owner.fullname}</Link>
                </h4>
            }
            <img src={`../assets/img/${car.vendor}.png`} alt="" />
        </article>
    )
}
