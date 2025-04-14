// Cập nhật file payrollService.js
const Payroll = require('../models/payroll');
const User = require('../models/User');
const PDFDocument = require('pdfkit'); // Thêm thư viện PDFKit
const fs = require('fs');
const path = require('path');

// Tỷ lệ thuế và bảo hiểm theo quy định Việt Nam
const PERSONAL_INCOME_TAX_RATE = 0.1; // 10% thuế TNCN
const SOCIAL_INSURANCE_RATE = 0.08; // 8% BHXH
const HEALTH_INSURANCE_RATE = 0.015; // 1.5% BHYT
const UNEMPLOYMENT_INSURANCE_RATE = 0.01; // 1% BHTN

const payrollService = {
    createPayroll: async (payrollData) => {
        const { 
            base_salary, 
            allowances, 
            deductions, 
            employee_id, 
            pay_period,
            region = 'I',
            status = 'Pending',
            // Nếu các trường này được gửi từ frontend, dùng giá trị đó
            // ngược lại tính toán dựa trên lương cơ bản
            social_insurance = base_salary * SOCIAL_INSURANCE_RATE,
            health_insurance = base_salary * HEALTH_INSURANCE_RATE,
            unemployment_insurance = base_salary * UNEMPLOYMENT_INSURANCE_RATE,
            personal_income_tax = base_salary * PERSONAL_INCOME_TAX_RATE
        } = payrollData;

        // Tính tổng khấu trừ
        const total_deductions = (
            social_insurance + 
            health_insurance + 
            unemployment_insurance + 
            personal_income_tax + 
            (deductions || 0)
        );

        // Tính lương thực nhận
        const net_salary = base_salary + (allowances || 0) - total_deductions;

        // Tạo bản ghi payroll với các trường bổ sung
        return await Payroll.create({
            employee_id,
            base_salary,
            allowances: allowances || 0,
            deductions: deductions || 0,
            social_insurance,
            health_insurance,
            unemployment_insurance,
            personal_income_tax,
            total_deductions,
            net_salary,
            pay_period,
            region,
            status
        });
    },

    getPayrollHistory: async (employeeId, month) => {
        let whereCondition = { employee_id: employeeId };
        if (month) {
            whereCondition.pay_period = month;
        }
        return await Payroll.findAll({ where: whereCondition });
    },

    getPayrollStatistics: async () => {
        const totalPayroll = await Payroll.sum('net_salary');
        const payrollCount = await Payroll.count();
        return { totalPayroll, payrollCount };
    },

    // Thêm phương thức để lấy tất cả bảng lương
    getAllPayrolls: async () => {
        try {
            return await Payroll.findAll({
                include: [{
                    model: User,
                    as: 'employee',
                    attributes: ['id', 'full_name', 'email']
                }],
                order: [['created_at', 'DESC']]
            });
        } catch (error) {
            console.error("Error fetching payrolls:", error);
            throw error;
        }
    },

    deletePayroll: async (payrollId) => {
        try {
            const result = await Payroll.destroy({ where: { id: payrollId } });
            return result > 0; // Trả về true nếu xóa thành công
        } catch (error) {
            console.error('Error deleting payroll:', error);
            throw error;
        }
    },

    // Cập nhật phương thức để xuất bảng lương PDF
    generatePayrollPDF: async (payrollId) => {
        try {
            // Lấy thông tin bảng lương
            const payroll = await Payroll.findByPk(payrollId, {
                include: [{
                    model: User,
                    as: 'employee',
                    attributes: ['id', 'full_name', 'email', 'position']
                }]
            });

            if (!payroll) {
                throw new Error('Không tìm thấy bảng lương');
            }

            // Tạo thư mục nếu chưa tồn tại
            const pdfDir = path.join(__dirname, '../', 'public', 'payrolls');
            if (!fs.existsSync(pdfDir)) {
                fs.mkdirSync(pdfDir, { recursive: true });
            }

            // Tạo đường dẫn file PDF
            const filePath = path.join(pdfDir, `payroll_${payrollId}.pdf`);
            
            // Tạo file PDF
            const doc = new PDFDocument({ margin: 50 });
            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            // Format tiền tệ
            const formatCurrency = (amount) => {
                return new Intl.NumberFormat('vi-VN', { 
                    style: 'currency', 
                    currency: 'VND',
                    maximumFractionDigits: 0 
                }).format(amount);
            };

            // Header
            doc.fontSize(20).text('PHIẾU LƯƠNG', { align: 'center' });
            doc.moveDown();
            
            // Thông tin nhân viên
            doc.fontSize(12);
            doc.text(`Mã nhân viên: ${payroll.employee_id}`);
            if (payroll.employee) {
                doc.text(`Tên nhân viên: ${payroll.employee.full_name || 'N/A'}`);
                doc.text(`Email: ${payroll.employee.email || 'N/A'}`);
                doc.text(`Chức vụ: ${payroll.employee.position || 'N/A'}`);
            }
            doc.text(`Kỳ lương: ${payroll.pay_period}`);
            doc.text(`Ngày tạo: ${new Date(payroll.created_at).toLocaleDateString('vi-VN')}`);
            doc.moveDown();

            // Bảng lương
            doc.text('CHI TIẾT LƯƠNG', { underline: true });
            doc.moveDown(0.5);
            
            // Các khoản thu nhập
            doc.text('KHOẢN THU NHẬP:');
            doc.text(`Lương cơ bản:          ${formatCurrency(payroll.base_salary)}`, { indent: 20 });
            doc.text(`Phụ cấp:               ${formatCurrency(payroll.allowances)}`, { indent: 20 });
            doc.text(`Tổng thu nhập:         ${formatCurrency(payroll.base_salary + payroll.allowances)}`, { indent: 20 });
            doc.moveDown();
            
            // Các khoản khấu trừ
            doc.text('KHOẢN KHẤU TRỪ:');
            doc.text(`BHXH (8%):             ${formatCurrency(payroll.social_insurance)}`, { indent: 20 });
            doc.text(`BHYT (1.5%):           ${formatCurrency(payroll.health_insurance)}`, { indent: 20 });
            doc.text(`BHTN (1%):             ${formatCurrency(payroll.unemployment_insurance)}`, { indent: 20 });
            doc.text(`Thuế TNCN:             ${formatCurrency(payroll.personal_income_tax)}`, { indent: 20 });
            doc.text(`Khấu trừ khác:         ${formatCurrency(payroll.deductions)}`, { indent: 20 });
            doc.text(`Tổng khấu trừ:         ${formatCurrency(payroll.total_deductions)}`, { indent: 20 });
            doc.moveDown();
            
            // Lương thực nhận
            doc.text(`LƯƠNG THỰC NHẬN:      ${formatCurrency(payroll.net_salary)}`, { bold: true });
            
            // Footer
            doc.moveDown(2);
            doc.fontSize(10);
            doc.text('Ghi chú: Phiếu lương này được tạo tự động bởi hệ thống.', { align: 'center' });
            
            // Finalize
            doc.end();

            // Đợi stream được hoàn thành
            return new Promise((resolve, reject) => {
                stream.on('finish', () => resolve(filePath));
                stream.on('error', reject);
            });
        } catch (error) {
            console.error('Error generating payroll PDF:', error);
            throw error;
        }
    },

    // Thêm phương thức cập nhật bảng lương
    updatePayroll: async (payrollId, payrollData) => {
        try {
            const payroll = await Payroll.findByPk(payrollId);
            
            if (!payroll) {
                throw new Error('Payroll not found');
            }
            
            const { 
                base_salary, 
                allowances, 
                deductions, 
                employee_id, 
                pay_period,
                region,
                status,
                social_insurance,
                health_insurance,
                unemployment_insurance,
                personal_income_tax,
                total_deductions,
                net_salary
            } = payrollData;
    
            // Update payroll record
            await payroll.update({
                employee_id: employee_id || payroll.employee_id,
                base_salary: base_salary || payroll.base_salary,
                allowances: allowances !== undefined ? allowances : payroll.allowances,
                deductions: deductions !== undefined ? deductions : payroll.deductions,
                social_insurance: social_insurance || payroll.social_insurance,
                health_insurance: health_insurance || payroll.health_insurance,
                unemployment_insurance: unemployment_insurance || payroll.unemployment_insurance,
                personal_income_tax: personal_income_tax || payroll.personal_income_tax,
                total_deductions: total_deductions || payroll.total_deductions,
                net_salary: net_salary || payroll.net_salary,
                pay_period: pay_period || payroll.pay_period,
                region: region || payroll.region,
                status: status || payroll.status
            });
    
            return payroll;
        } catch (error) {
            console.error('Error updating payroll:', error);
            throw error;
        }
    }
};

module.exports = payrollService;