import { Checkout } from "../sections/Checkout"
import Header from "../sections/Header"

function CheckOutPage() {
    return (
        <div>
            <Header />
            <div className="container mt-22">
                <Checkout />
            </div>
        </div>
    )
}

export default CheckOutPage