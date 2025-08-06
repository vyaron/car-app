const { Link } = ReactRouterDOM

import { authService } from '../services/auth.service.local.js'
import { CarPreview } from './CarPreview.jsx'

export function CarList({ cars, onRemoveCar }) {
	const loggedinUser = authService.getLoggedinUser()

    function canUpdateCar(car){
        if (!car.owner) return true
        return car.owner._id === loggedinUser._id
    }

	return <ul className="car-list">
        {cars.map(car => (
            <li key={car._id}>
                <CarPreview car={car} />
                <section className="actions">
                    <button>
                        <Link to={`/car/${car._id}`}>Details</Link>
                    </button>
                    {
                        canUpdateCar(car) && 
                        <div>
                            <button onClick={() => onRemoveCar(car._id)}>Remove Car</button>
                            <button>
                                <Link to={`/car/edit/${car._id}`}>Edit</Link>
                            </button>
                        </div>
                    }
                </section>
            </li>
        ))}
    </ul>
}
