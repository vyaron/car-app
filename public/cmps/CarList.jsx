const { Link } = ReactRouterDOM

import { authService } from '../services/auth.service.local.js'
import { CarPreview } from './CarPreview.jsx'

export function CarList({ cars, onRemoveCar }) {
	const user = authService.getLoggedinUser()

	return <ul className="car-list">
        {cars.map(car => (
            <li key={car._id}>
                <CarPreview car={car} />
                <section className="actions">
                    <button>
                        <Link to={`/car/${car._id}`}>Details</Link>
                    </button>
                    <div>
                        <button onClick={() => onRemoveCar(car._id)}>Remove Car</button>
                        <button>
                            <Link to={`/car/edit/${car._id}`}>Edit</Link>
                        </button>
                    </div>
                </section>
            </li>
        ))}
    </ul>
}
