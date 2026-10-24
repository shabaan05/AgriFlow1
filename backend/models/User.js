const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')

const ROLES = ['farmer', 'buyer', 'transporter', 'admin']

const farmInfoSchema = new mongoose.Schema({
  farmName:     { type: String, trim: true, default: '' },
  farmLocation: { type: String, trim: true, default: '' },
  farmSize:     { type: String, trim: true, default: '' },
  farmingType:  { type: String, trim: true, default: '' },
  mainCrops:    { type: [String], default: [] },
  description:  { type: String, trim: true, default: '' },
}, { _id: false })

const buyerInfoSchema = new mongoose.Schema({
  companyName:   { type: String, trim: true, default: '' },
  businessType:  { type: String, trim: true, default: '' }, // e.g. Wholesale, Retail, Export
  address:       { type: String, trim: true, default: '' },
  city:          { type: String, trim: true, default: '' },
  state:         { type: String, trim: true, default: '' },
  pincode:       { type: String, trim: true, default: '' },
  gstNumber:     { type: String, trim: true, default: '' },
  description:   { type: String, trim: true, default: '' },
}, { _id: false })

const verificationSchema = new mongoose.Schema({
  status:        { type: String, enum: ['Not Verified', 'Pending', 'Verified'], default: 'Not Verified' },
  submittedAt:   { type: Date, default: null },
  verifiedAt:    { type: Date, default: null },
  documentType:  { type: String, default: '' },   // e.g. "Aadhaar", "Land Record"
  notes:         { type: String, default: '' },
}, { _id: false })

// Sensitive fields are masked in toSafeObject — never expose full account number
const paymentDetailsSchema = new mongoose.Schema({
  accountHolderName: { type: String, trim: true, default: '' },
  bankName:          { type: String, trim: true, default: '' },
  accountNumber:     { type: String, trim: true, default: '' },  // stored plain, masked on output
  ifscCode:          { type: String, trim: true, default: '' },
  upiId:             { type: String, trim: true, default: '' },
  preferredMethod:   { type: String, enum: ['Bank Transfer', 'UPI', 'Cash', ''], default: '' },
  isSet:             { type: Boolean, default: false },
}, { _id: false })

const transporterInfoSchema = new mongoose.Schema({
  address: { type: String, trim: true, default: '' },
  city:    { type: String, trim: true, default: '' },
  state:   { type: String, trim: true, default: '' },
  pincode: { type: String, trim: true, default: '' },
}, { _id: false })

const vehicleInfoSchema = new mongoose.Schema({
  vehicleType:         { type: String, trim: true, default: '' },
  vehicleNumber:       { type: String, trim: true, default: '' },
  capacity:            { type: String, trim: true, default: '' },
  availability:        { type: String, enum: ['Available', 'Unavailable', 'On Trip', ''], default: '' },
  description:         { type: String, trim: true, default: '' },
  verificationStatus:  { type: String, enum: ['Not Verified', 'Pending', 'Verified'], default: 'Not Verified' },
}, { _id: false })

const notificationPrefsSchema = new mongoose.Schema({
  emailBookings:   { type: Boolean, default: true },
  emailOrders:     { type: Boolean, default: true },
  emailPayments:   { type: Boolean, default: true },
  pushBookings:    { type: Boolean, default: true },
  pushOrders:      { type: Boolean, default: true },
  pushPayments:    { type: Boolean, default: true },
  pickupAlerts:          { type: Boolean, default: true },
  tripUpdates:           { type: Boolean, default: true },
  pickupReminders:       { type: Boolean, default: true },
  deliveryUpdates:       { type: Boolean, default: true },
  earningsUpdates:       { type: Boolean, default: true },
  systemNotifications:   { type: Boolean, default: true },
}, { _id: false })

const userSchema = new mongoose.Schema(
  {
    name:  { type: String, required: [true, 'Name is required'], trim: true, maxlength: 100 },
    email: {
      type: String, required: [true, 'Email is required'], unique: true,
      lowercase: true, trim: true, match: [/^\S+@\S+\.\S+$/, 'Invalid email'],
    },
    password:  { type: String, required: true, minlength: 6, select: false },
    phone:     { type: String, trim: true, default: '' },
    role:      { type: String, enum: ROLES, default: 'farmer' },
    avatar:    { type: String, default: '' },

    farmInfo:          { type: farmInfoSchema,         default: () => ({}) },
    buyerInfo:         { type: buyerInfoSchema,         default: () => ({}) },
    transporterInfo:   { type: transporterInfoSchema,  default: () => ({}) },
    vehicleInfo:       { type: vehicleInfoSchema,      default: () => ({}) },
    verification:      { type: verificationSchema,     default: () => ({}) },
    paymentDetails:    { type: paymentDetailsSchema,   default: () => ({}) },
    notificationPrefs: { type: notificationPrefsSchema,default: () => ({}) },
  },
  { timestamps: true, versionKey: false }
)

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

userSchema.methods.matchPassword = async function (plain) {
  return bcrypt.compare(plain, this.password)
}

/** Safe object — never exposes password or full account number */
userSchema.methods.toSafeObject = function () {
  const pd = this.paymentDetails || {}
  const maskedAccount = pd.accountNumber
    ? '•••• •••• ' + pd.accountNumber.slice(-4)
    : ''

  return {
    id:        this._id.toString(),
    name:      this.name,
    email:     this.email,
    phone:     this.phone,
    role:      this.role,
    avatar:    this.avatar,
    createdAt: this.createdAt,
    farmInfo:          this.farmInfo || {},
    buyerInfo:         this.buyerInfo || {},
    transporterInfo:   this.transporterInfo || {},
    vehicleInfo:       this.vehicleInfo || {},
    verification:      this.verification || {},
    notificationPrefs: this.notificationPrefs || {},
    paymentDetails: {
      accountHolderName: pd.accountHolderName || '',
      bankName:          pd.bankName          || '',
      accountNumber:     maskedAccount,
      ifscCode:          pd.ifscCode ? '•••••' + pd.ifscCode.slice(-3) : '',
      upiId:             pd.upiId             || '',
      preferredMethod:   pd.preferredMethod   || '',
      isSet:             pd.isSet             || false,
    },
  }
}

module.exports = mongoose.model('User', userSchema)
